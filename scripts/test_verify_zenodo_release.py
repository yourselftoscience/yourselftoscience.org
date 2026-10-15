import copy
import unittest

from verify_zenodo_release import CONCEPT, REPOSITORY, find_doi, matching_doi


def record(tag="v2026.06.12"):
    return {
        "conceptrecid": CONCEPT,
        "doi": "10.5281/zenodo.20652062",
        "files": [{"key": "source.zip"}],
        "metadata": {
            "version": tag,
            "access_right": "open",
            "related_identifiers": [{
                "identifier": f"https://github.com/{REPOSITORY}/tree/{tag}",
                "relation": "isSupplementTo",
            }],
        },
    }


class ReleaseMatchTests(unittest.TestCase):
    def test_exact_release(self):
        self.assertEqual(matching_doi(record(), "v2026.06.12"), "10.5281/zenodo.20652062")

    def test_old_release_is_not_a_fallback(self):
        self.assertIsNone(matching_doi(record(), "v2026.10.15"))

    def test_same_tag_in_wrong_repository_is_rejected(self):
        value = record()
        value["metadata"]["related_identifiers"][0]["identifier"] = "https://github.com/other/repo/tree/v2026.06.12"
        self.assertIsNone(matching_doi(value, "v2026.06.12"))

    def test_incomplete_or_wrong_series_is_rejected(self):
        for key, replacement in [("files", []), ("conceptrecid", "999"), ("doi", f"10.5281/zenodo.{CONCEPT}")]:
            with self.subTest(key=key):
                value = record()
                value[key] = replacement
                self.assertIsNone(matching_doi(value, "v2026.06.12"))

    def test_closed_archive_is_rejected(self):
        value = record()
        value["metadata"]["access_right"] = "restricted"
        self.assertIsNone(matching_doi(value, "v2026.06.12"))

    def test_pagination_finds_exact_release(self):
        old = record("v2025.03.30")
        pages = iter([{"hits": {"hits": [copy.deepcopy(old) for _ in range(25)]}}, {"hits": {"hits": [record()]}}])
        self.assertEqual(find_doi("v2026.06.12", lambda _: next(pages)), "10.5281/zenodo.20652062")

    def test_missing_release_returns_none(self):
        self.assertIsNone(find_doi("v2026.10.15", lambda _: {"hits": {"hits": [record()]}}))


if __name__ == "__main__":
    unittest.main()
