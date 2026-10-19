# Agent and API Authentication

Yourself to Science is intentionally public, read-only, and authentication-free.

## Registration

No agent registration is required.

## Public interfaces

- Website and Markdown representations: `https://yourselftoscience.org/`
- OpenAPI description: `https://yourselftoscience.org/openapi.json`
- Complete CC0 dataset: `https://yourselftoscience.org/resources.json`
- Remote MCP server: `https://mcp.yourselftoscience.org/mcp`
- A2A JSON-RPC endpoint: `https://yourselftoscience.org/api/a2a`
- API and agent discovery: `https://yourselftoscience.org/.well-known/api-catalog`

## Credentials and scopes

No API key, OAuth token, cookie, client certificate, account, or scope is required for these public read-only interfaces.

## Allowed use

Automated retrieval, indexing, search, AI input, and model training are permitted. The dataset is dedicated to the public domain under CC0 1.0. Website prose and source code have separate licences, described on the relevant licence pages.

## Write operations

The public machine interfaces do not expose write operations. Contributions and corrections should use the public project repository or the contact channels listed on the website.

## Security contact

Report security issues through the repository security policy. General enquiries may be sent to `hello@yourselftoscience.org`.

Because there is no protected resource or authorization server, this site intentionally does not publish misleading OAuth/OIDC discovery documents.
