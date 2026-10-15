# Cloudflare framework security upgrade

The site uses Next.js 15.5.28 and OpenNext Cloudflare 1.20.12. The archived
`@cloudflare/next-on-pages` adapter cannot run this patched framework line.
Node.js 22 or later is required by Wrangler. React remains on the compatible
18.3.1 line to avoid an unrelated UI migration.

## Verification

```sh
npm ci
npm audit --omit=dev
npm test
python3 -m unittest discover -s scripts -p 'test_verify_zenodo_release.py'
npm run preview
# In another terminal:
Y2S_TEST_URL=http://localhost:8787 npm test
```

`preview`, `upload`, and `deploy` use the OpenNext CLI, which populates the
prerendered static cache before starting/uploading the Worker. A bare
`wrangler dev` or `wrangler deploy` skips that step and is not equivalent.
No R2 bucket, Durable Object, or new permission grant is required.

For an offline build from checked-in catalogue exports, run `npx next build`
then `npx opennextjs-cloudflare build --skipNextBuild`, followed by
`npx opennextjs-cloudflare preview`. The normal build retains the existing
optional enrichment and PDF generation scripts. Failed enrichment can alter
local generated files; review those changes separately and do not commit
network-failure fallbacks as catalogue updates.

## Production cutover

The custom domains currently use Cloudflare Pages (`yourselftoscience-org`,
branch `main`). The existing `yourselftoscience-web` Worker uses a different
branch with additional agent API work. Do not overwrite that branch or move
live domains as a side effect of merging this change.

1. Deploy this revision to an isolated Worker preview, using an explicit
   `--name` override with the OpenNext CLI. The configuration defaults to the
   new `yourselftoscience-catalogue` Worker; it never overwrites the existing
   `yourselftoscience-web` service. A verified preview is available at
   https://yourselftoscience-security-20261015.cor-ling.workers.dev .
2. Compare HTML/RSC navigation, catalogue exports, UUID redirects, badges,
   analytics, and contact/subscription behavior against Pages. Confirm the
   runtime variables required by Resend and Mailchimp are available without
   displaying secret values. Test providers in a controlled environment.
3. Configure the new catalogue Worker build to use this revision and the
   OpenNext deploy command. Leave the separate agent API Worker unchanged.
4. Move the existing public domains only after the preview passes. Check
   `yourselftoscience.org` and `.com` explicitly. If enabling the identifier
   host (currently not resolving), verify its canonical redirects too.
5. Keep the Pages deployment available for rollback until the cutover is
   verified. Revert routing to the prior Pages deployment if needed.

Merging this PR alone does not patch the current Pages production runtime.
Do not describe the live vulnerability as resolved before cutover and checks.

## Remaining development-tool advisories

The production dependency audit is clean as of 15 October 2026. The full graph
still reports development-only pattern/selector parser advisories through
Tailwind 3 and ESLint tooling. These are not Next.js runtime dependencies.
Do not run builds on untrusted source with production credentials. Updating
Tailwind's major version is a separate compatibility change, not an audit
suppression or a substitute for patching the deployed framework.

The isolated preview has no provider credentials. Production Pages holds four
required secrets: `RESEND_API_KEY`, `MAILCHIMP_API_KEY`,
`MAILCHIMP_AUDIENCE_ID`, and `MAILCHIMP_SERVER_PREFIX`. They are encrypted and
cannot be recovered from the dashboard. An authorized operator must supply them
to the replacement Worker before cutover; do not print them, commit them, or
route contact/newsletter traffic to a Worker lacking them.

## Production routing (15 October 2026)

The verified Worker was renamed to `yourselftoscience-catalogue`, preserving
all four encrypted mail-provider secrets. Both apex domains now route all
paths to it. The route patterns and zones are recorded in `wrangler.jsonc`
so future deployments preserve routing. The separate `yourselftoscience-web`
agent API Worker remains unchanged.

Pages is retained as the rollback origin. Removing the two Worker routes
restores the existing Pages deployment; its old runtime must not be treated
as patched. Do not revoke the old mail keys while rollback is still needed.
The Pages-owned `pages.dev` URLs remain legacy exposures until retired or
protected; the live-domain migration does not patch those historic deployments.

The root test command scopes discovery to root scripts. The separately locked
MCP service has its own install, protocol test and CI job, and is not imported
by the website test runner.
