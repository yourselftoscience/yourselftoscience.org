# MCP dependency security upgrade

This service keeps its existing `McpAgent` transport, `/mcp` endpoint, eleven
read-only tools, `MCP_OBJECT` binding, and SQLite migration. It uses
`agents@0.28.1`, the matching legacy MCP SDK `1.32.1`, and Wrangler `4.151.0`.
The unused optional shell dependency is not installed. Node.js 22.18+ or 24.11+ is required by the resolved tooling.

```sh
npm ci --ignore-scripts
npm audit
npm run typecheck
./node_modules/.bin/wrangler deploy --dry-run --outdir /tmp/y2s-mcp-bundle
npm run dev -- --local --port 8790
# In another terminal:
MCP_TEST_URL=http://localhost:8790/mcp npm test
```

The integration test reads the public catalogue; network failure is a failed
validation, not a passing offline substitute. It connects a real MCP client,
checks all eleven tools and their read-only annotations, UUID/slug lookup,
pagination/defaults, citation retrieval, invalid limits, and session termination.
Tests only run against an explicitly supplied `MCP_TEST_URL`.

The prior audit included a critical `proxy-addr` dependency alert. This service
does not start Express or configure trusted proxy subnets; the alert did not
establish a deployed IP-spoofing path. Similarly, the SDK OAuth client advisory
does not apply to this authless server. Updating the graph removes the affected
installed versions without claiming those attacks were reproduced on Workers.

Before updating the existing `yts-mcp` Worker, verify its live bindings/routes
and retain the existing Durable Object namespace and migration history. Do not
rename the class, recreate its namespace, or migrate clients to a new transport
as part of this patch. No public deployment or directory publication is implied
by this source update.
