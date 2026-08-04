# Cloudflare Workers deployment and agent API security

This application is deployed as a full-stack Next.js Worker through `@opennextjs/cloudflare`. The former Cloudflare Pages and `@cloudflare/next-on-pages` deployment path is retained only as a temporary rollback target until the Worker passes live verification and the custom-domain cutover is complete.

## Validated repository configuration

The repository currently uses:

- Worker name: `yourselftoscience-web`
- Node.js: `22.23.1`
- Next.js: `15.5.22`
- React and React DOM: `19.2.8`
- OpenNext Cloudflare adapter: `1.20.2`
- Wrangler: `4.114.0`
- Worker entry point: `.open-next/worker.js`
- Static assets: `.open-next/assets`, exposed through the `ASSETS` binding
- Compatibility date: `2026-08-04`
- Compatibility flags: `nodejs_compat`, `global_fetch_strictly_public`
- OpenNext static-assets incremental cache; no R2, D1, KV, Durable Objects, Queues, Browser Rendering, or Images binding

All route-level `export const runtime = 'edge'` declarations have been removed because OpenNext uses the Next.js Node.js runtime on Cloudflare Workers.

GitHub Actions must remain read-only. It installs the locked dependencies, runs regression tests, regenerates and validates agent artifacts, builds the OpenNext Worker, performs a Wrangler dry run, enforces the Workers Free compressed-size limit of 3 MiB, and blocks high or critical runtime dependency findings.

## Create the Worker from GitHub

In Cloudflare, choose **Workers & Pages → Create application → Continue with GitHub** and configure:

| Setting | Value |
| --- | --- |
| Repository | `yourselftoscience/yourselftoscience.org` |
| Worker name | `yourselftoscience-web` |
| Production branch during migration | `feat/agent-ready-cloudflare` |
| Root directory | Leave blank |
| Build command | `npx @opennextjs/cloudflare build` |
| Deploy command | `npx @opennextjs/cloudflare deploy -- --keep-vars` |
| Non-production branch deploy command | `npx @opennextjs/cloudflare upload -- --keep-vars` |
| Build cache | Enabled |
| Non-production branch builds | Enabled |

The Cloudflare Worker name must exactly match the `name` in `wrangler.jsonc`.

Add this **build variable**:

| Type | Name | Value |
| --- | --- | --- |
| Plaintext | `NODE_VERSION` | `22.23.1` |

`NEXTJS_ENV` does not need to be configured for production because OpenNext defaults it to `production`.

Keep the generated Workers API token. Do not create a custom token unless the automatically generated token fails or organizational policy requires one.

## Runtime secrets

After the Worker exists, open **Worker → Settings → Variables and Secrets** and add each item as type **Secret**:

- `RESEND_API_KEY`
- `MAILCHIMP_API_KEY`
- `MAILCHIMP_AUDIENCE_ID`
- `MAILCHIMP_SERVER_PREFIX`

Select **Deploy** after saving the secrets. They are consumed at runtime through `process.env` and must not be added as plaintext variables or committed to Git.

For local development, copy `.dev.vars.example` to `.dev.vars`, replace the placeholders, and never commit that file.

## Runtime settings

Use the following settings:

| Setting | Value |
| --- | --- |
| Workers.dev | Enabled during migration |
| Preview URLs | Enabled |
| Placement | Default |
| Observability | Enabled |
| Log sampling | 100% during migration; reduce later if volume warrants it |
| Fail open | Not applicable to the Worker deployment |
| R2/D1/KV/Durable Objects/Queues | None |
| Images binding | None |

The site intentionally keeps `images.unoptimized: true`, so no Cloudflare Images binding is needed.

## Free-plan rate limiting

The Cloudflare Free plan provides one zone-level rate-limiting rule. Use it for all dynamic API and analytics-event routes rather than static pages.

**Name:** `API and dynamic endpoint protection`

**Expression:**

```text
(starts_with(http.request.uri.path, "/api/") or http.request.uri.path eq "/umami/api/send")
```

**Counting characteristic:** IP address

**Threshold:** 30 requests per 10 seconds

**Mitigation timeout:** 10 seconds

**Action:** Block

**Status:** Active

This rule does not apply to static pages, images, JavaScript, CSS, datasets, or other static assets. Keep it at the zone level so it follows the `yourselftoscience.org` hostname after the Pages-to-Workers cutover.

## Preview verification

Do not attach the production domain immediately. First test the provided Workers preview or `workers.dev` hostname.

Replace `<preview-host>` below with the actual host:

```bash
curl --fail-with-body https://<preview-host>/
curl --fail-with-body https://<preview-host>/.well-known/agent-card.json
curl --fail-with-body https://<preview-host>/api/health
curl --fail-with-body 'https://<preview-host>/api/resources?limit=1'
curl --fail-with-body 'https://<preview-host>/api/resources?activelyRecruiting=false&limit=1'
curl --fail-with-body https://<preview-host>/api/facets
curl --fail-with-body https://<preview-host>/openapi.json
curl --fail-with-body https://<preview-host>/llms.txt
curl --fail-with-body https://<preview-host>/resources.json
curl --fail-with-body https://<preview-host>/umami/script.js
```

The following malformed requests must return HTTP 400 without exposing an exception or stack trace:

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

Require HTTP 415 for the first analytics request and HTTP 413 for the second. Confirm middleware redirects include `Cache-Control: private, no-store`.

Also test:

- a real contact-form submission through Resend;
- a Mailchimp subscription that enters the pending/double-opt-in state;
- a valid JSON analytics event;
- representative resource and data-type pages;
- browser navigation, CSS, icons, and downloadable data files;
- Worker logs for uncaught exceptions, CPU-limit errors, or missing bindings.

## MCP verification

The MCP service remains a separate Worker and must not be moved or captured by the website Worker:

```text
https://mcp.yourselftoscience.org/mcp
```

Verify initialization:

```bash
curl -i -X POST 'https://mcp.yourselftoscience.org/mcp' \
  -H 'Origin: https://yourselftoscience.org' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"deployment-smoke-test","version":"1.0.0"}}}'
```

Require a valid JSON-RPC or SSE response, preserve any returned `Mcp-Session-Id`, and verify `tools/list` through the same session.

A hostile browser origin must be rejected:

```bash
curl -i -X POST 'https://mcp.yourselftoscience.org/mcp' \
  -H 'Origin: https://attacker.invalid' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"origin-security-test","version":"1.0.0"}}}'
```

Treat acceptance of the hostile origin as a deployment blocker.

## Custom-domain cutover

Only after the Worker preview passes:

1. Record the existing Pages custom domains and current DNS configuration.
2. Remove `yourselftoscience.org` from the `yourselftoscience-org` Pages project.
3. Add `yourselftoscience.org` as a custom domain on `yourselftoscience-web`.
4. Move `www.yourselftoscience.org` as well if it is currently attached to Pages.
5. Do not add a wildcard route or wildcard custom domain.
6. Leave `mcp.yourselftoscience.org` attached exclusively to `yts-mcp`.
7. Repeat all production smoke tests and confirm the rate-limiting rule records events.
8. Keep the Pages project undeleted until the Worker has operated correctly in production and rollback is no longer needed.

After the cutover is verified, change the Worker production branch from `feat/agent-ready-cloudflare` to `main`, merge the pull request, and verify the resulting `main` deployment before retiring Pages.

## Operational monitoring

Monitor:

- `/api/*` and `/umami/api/send` request rates and 429 responses;
- Worker CPU time, exceptions, and invocation counts;
- `/api/health` 503 responses;
- upstream `resources.json` fetch failures;
- contact and subscription provider failures;
- MCP initialization failures, Origin rejections, and tool-call latency.

Do not expose exception messages, stack traces, secret values, bindings, session identifiers, or deployment metadata in public responses.
