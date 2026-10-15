"""Verify a public Zenodo archive without publishing or changing anything."""

import argparse
import json
import os
import re
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

REPOSITORY = "yourselftoscience/yourselftoscience.org"
CONCEPT = "15109359"


def matching_doi(record, tag):
    """Require this series, exact tag, GitHub source, open access and files."""
    metadata = record.get("metadata", {})
    source = f"https://github.com/{REPOSITORY}/tree/{tag}"
    doi = record.get("doi", "")
    if (
        str(record.get("conceptrecid")) != CONCEPT
        or metadata.get("version") != tag
        or not any(
            item.get("identifier", "").rstrip("/") == source
            and item.get("relation") == "isSupplementTo"
            for item in metadata.get("related_identifiers", [])
        )
        or metadata.get("access_right") != "open"
        or not record.get("files")
        or not re.fullmatch(r"10\.5281/zenodo\.[0-9]+", doi)
        or doi == f"10.5281/zenodo.{CONCEPT}"
    ):
        return None
    return doi


def read_json(url):
    with urlopen(url, timeout=30) as response:
        return json.load(response)


def find_doi(tag, fetch=None):
    fetch = fetch or read_json
    page = 1
    while True:
        query = urlencode({
            "q": f"conceptrecid:{CONCEPT}",
            "all_versions": "true", "size": 25, "page": page,
        })
        records = fetch(f"https://zenodo.org/api/records?{query}")["hits"]["hits"]
        for record in records:
            doi = matching_doi(record, tag)
            if doi:
                return doi
        if len(records) < 25:
            return None
        page += 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("tag")
    parser.add_argument("--attempts", type=int, default=1)
    parser.add_argument("--interval", type=int, default=30)
    args = parser.parse_args()
    if not re.fullmatch(r"v[0-9][A-Za-z0-9._-]*", args.tag):
        parser.error("Expected a version tag starting with v and a digit")
    if not 1 <= args.attempts <= 12 or not 0 <= args.interval <= 30:
        parser.error("attempts must be 1–12 and interval 0–30 seconds")
    for attempt in range(args.attempts):
        try:
            doi = find_doi(args.tag)
        except (HTTPError, URLError, TimeoutError, ValueError, KeyError) as error:
            print(f"Zenodo lookup unavailable: {error}")
            doi = None
        if doi:
            result = f"Verified {args.tag}: https://doi.org/{doi}"
            print(result)
            if os.environ.get("GITHUB_STEP_SUMMARY"):
                with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as output:
                    output.write(result + "\n")
            return 0
        if attempt + 1 < args.attempts:
            time.sleep(args.interval)
    print(f"No verified archive for {args.tag}; no fallback DOI was substituted.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
