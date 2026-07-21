# Cloudflare agent API security controls

The application code validates and bounds all public inputs, but globally consistent request throttling must run before the Pages Function is invoked. Configure the following zone-level Cloudflare WAF rate-limiting rules before promoting the agent API to production.

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
```

The following malformed requests must return HTTP 400 without an internal exception message:

```bash
curl -i 'https://<preview-host>/api/resources?activelyRecruiting=yes'
curl -i 'https://<preview-host>/api/resources?limit=1.5'
curl -i 'https://<preview-host>/api/resources?q=a&q=b'
curl -i 'https://<preview-host>/api/resources/%252Fetc'
```

Confirm the WAF rule produces a rate-limit response after the configured threshold and that the Pages Function invocation count stops increasing for blocked requests.

## Operational monitoring

Alert on sustained increases in:

- `/api/*` requests and 429 responses;
- Pages Function CPU time and invocation count;
- `/api/health` 503 responses;
- upstream `resources.json` fetch failures in Cloudflare logs.

Do not expose exception messages, stack traces, bindings, or deployment metadata in public API responses.
