# Releases and Zenodo archives

Normal pushes do not create releases. Publish an intentional, reviewed GitHub
release when a reproducible project snapshot is ready. Zenodo's existing native
integration archives the release; no Zenodo API token is required.

The DOI workflow now verifies published releases. It can also be run manually
with an existing release tag to retry delayed Zenodo ingestion. It requires the
exact version, this project's DOI series, the matching GitHub source URL, open
access and archive files. An unavailable or missing archive fails verification;
an older DOI is never substituted. The workflow has read-only permissions and
does not write back to the repository.

Before releasing, run the project's applicable checks, review generated files,
and verify the release commit and metadata. Do not overwrite existing tags or
release assets. After verification, inspect the public archive and update any
version-specific website citation deliberately. Use all-version DOI
10.5281/zenodo.15109359 for the evolving project.

## Component licences

The archived repository is a mixed work:

- code: AGPL-3.0-or-later, in LICENSE-CODE;
- authored content: CC-BY-SA-4.0, in LICENSE-CONTENT;
- directory dataset: CC0-1.0, in LICENSE-DATASET.

These are component-specific grants, not alternatives for all files. Preserve
third-party notices. The archive-level label Other (Open) refers to that mixture;
it does not change any licence. A software ZIP must not be labelled wholly CC0.

Zenodo uses .zenodo.json for its archive metadata; CITATION.cff remains available
for GitHub citations. Keep their title, creator and component-licence explanation
consistent. Version/date are supplied by the release rather than hardcoded.

The existing v2026.06.12 archive has DOI 10.5281/zenodo.20652062. Updating this
repository does not retroactively edit that record or change its archived files.

## Verification

```sh
python3 -m unittest discover -s scripts -p test_verify_zenodo_release.py
python3 scripts/verify_zenodo_release.py v2026.06.12
```

The second command is a read-only live positive control. A nonexistent version
must fail. No release is created by either command.
