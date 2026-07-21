# Cloudflare agent API security controls

The application code validates and bounds all public inputs, but globally consistent request throttling must run before the Pages Function is invoked. Configure the following zone-level Cloudflare WAF rate-limiting rules before promoting the agent API to production.

## Runtime and adapter prerequisites

The repository pins Node.js `22.23.1` in `.node-version`. In Cloudflare Pages, set the `NODE_VERSION` environment variable to the same value because a dashboard environment variable takes precedence over repository version files. Do not continue using Node.js `22.14.0`.

The current Pages deployment uses the archived `@cloudflare/next-on-pages` adapter, which supports Next.js 13 and 14 but cannot consume the patched Next.js 15 security line. The branch therefore applies temporary reachability mitigations:

- the self-hosted Next image optimizer is disabled with `images.unoptimized: true`;
- external Next rewrites were replaced with fixed-destination, bounded Edge route handlers;
- middleware redirects are marked `private, no-store` and vary on `x-nextjs-data`;
- the repository contains no App Router Server Functions (`"use server"`);
- Cloudflare's managed WAF protections for the disclosed React Server Component denial-of-service vectors should remain enabled.

These controls reduce the reachable risk but do not make the old Next.js package version patched. A full package-level remediation requires migrating this full-stack application from Pages/`next-on-pages` to Cloudflare Workers with `@opennextjs/cloudflare`, then upgrading to a currently supported patched Next.js release (at minimum the patched 15.5.16 line or newer). Treat that migration as a production requirement rather than suppressing the runtime audit finding.

## Required rate-limiting rule

Create a rate-limiting rule for the `yourselftoscience.org` zone.

**Name:** `Agent API per-IP limit`

**Expression:**

```text
(http.host eq "yourselftoscience.org" and starts_with(http.request.uri.path, "/api/") and http.request.method ne "OPTIONS")
```

**Counting characteristic:** IP address

**Threshold:** 120 requests per 60 seconds

**Mitigation timeout:** 60 seconds

**Action:** Block

This limit is deliberately above normal interactive and agent discovery usage while bounding repeated full-catalogue filtering and function invocations. Tighten it after reviewing production analytics.

## Health endpoint rule

Create a second, narrower rule before the general rule.

**Name:** `Agent API health limit`

**Expression:**

```text
(http.host eq "yourselftoscience.org" and http.request.uri.path eq "/api/health" and http.request.method ne "OPTIONS")
```

**Counting characteristic:** IP address

**Threshold:** 30 requests per 60 seconds

**Mitigation timeout:** 60 seconds

**Action:** Block

## Deployment checks

After a Cloudflare Pages preview is available, verify:

```bash
curl --fail-with-body https://<preview-host>/.well-known/agent-card.json
curl --fail-with-body https://<preview-host>/api/health
curl --fail-with-body 'https://<preview-host>/api/resources?limit=1'
curl --fail-with-body 'https://<preview-host>/api/resources?activelyRecruiting=false&limit=1'
curl --fail-with-body 'https://<preview-host>/api/facets'
curl --fail-with-body https://<preview-host>/openapi.json
curl --fail-with-body https://<preview-host>/umami/script.js
```

The following malformed requests must return HTTP 400 without an internal exception message:

```bash
curl -i 'https://<preview-host>/api/resources?activelyRecruiting=yes'
curl -i 'https://<preview-host>/api/resources?limit=1.5'
curl -i 'https://<preview-host>/api/resources?q=a&q=b'
curl -i 'https://<preview-host>/api/resources/%252Fetc'
```

The analytics event proxy must reject unsupported and oversized events:

```bash
curl -i -X POST 'https://<preview-host>/umami/api/send' \
  -H 'Content-Type: text/plain' \
  --data 'not-json'

python - <<'PY' | curl -i -X POST 'https://<preview-host>/umami/api/send' \
  -H 'Content-Type: application/json' \
  --data-binary @-
import json
print(json.dumps({'payload': 'x' * (70 * 1024)}))
PY
```

Require HTTP 415 for the first request and HTTP 413 for the second. Confirm middleware-generated redirects include `Cache-Control: private, no-store`.

Confirm the WAF rule produces a rate-limit response after the configured threshold and that the Pages Function invocation count stops increasing for blocked requests.

## MCP deployment checks

The canonical remote MCP endpoint is separate from Cloudflare Pages:

```text
https://mcp.yourselftoscience.org/mcp
```

Verify a Streamable HTTP initialization request using the currently published stable protocol version:

```bash
curl -i -X POST 'https://mcp.yourselftoscience.org/mcp' \
  -H 'Origin: https://yourselftoscience.org' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"deployment-smoke-test","version":"1.0.0"}}}'
```

Require a valid JSON-RPC or SSE response, verify the negotiated protocol version, and preserve any returned `Mcp-Session-Id` for subsequent requests. Then call `tools/list` through the same session and confirm the advertised tools are read-only and match the public documentation.

The endpoint must validate the HTTP `Origin` header. A hostile web origin must be rejected rather than processed:

```bash
curl -i -X POST 'https://mcp.yourselftoscience.org/mcp' \
  -H 'Origin: https://attacker.invalid' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"origin-security-test","version":"1.0.0"}}}'
```

Treat acceptance of an untrusted browser origin as a deployment blocker. Also confirm the MCP service has its own request limits, payload-size limit, bounded tool arguments, generic public errors, and no privileged write tools.

## Operational monitoring

Alert on sustained increases in:

- `/api/*` requests and 429 responses;
- Pages Function CPU time and invocation count;
- `/api/health` 503 responses;
- upstream `resources.json` fetch failures in Cloudflare logs;
- MCP initialization failures, protocol errors, Origin rejections, and tool-call latency.

Do not expose exception messages, stack traces, bindings, session identifiers, or deployment metadata in public API responses or logs visible to clients.
