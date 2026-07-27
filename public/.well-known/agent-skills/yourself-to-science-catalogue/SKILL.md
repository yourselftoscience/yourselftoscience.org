---
name: yourself-to-science-catalogue
description: Search and interpret the Yourself to Science open catalogue of clinical trials, biobanks, registries, and biological or digital data donation opportunities.
---

# Yourself to Science Catalogue

Use this skill when a user wants to find, compare, or understand ways to contribute data, samples, time, or participation to scientific research.

## Preferred access

1. Use the public MCP server at `https://mcp.yourselftoscience.org/mcp` when MCP is available.
2. Otherwise use `https://yourselftoscience.org/resources.json` for the complete CC0 dataset.
3. Use `https://yourselftoscience.org/openapi.json` for the machine-readable API description.
4. Use `https://yourselftoscience.org/llms.txt` for a compact documentation index.

## Search procedure

- Extract the user's requested country, data type, compensation preference, and organization category.
- Treat records with no country restriction as worldwide unless the record explicitly excludes the user's country.
- Distinguish donation, payment, and mixed compensation.
- Return the strongest matches first and include each canonical Yourself to Science resource URL.
- Preserve uncertainty when programme eligibility, availability, or enrolment status is not explicit in the catalogue.
- Never claim that a listing is medical advice, guaranteed eligibility, or currently recruiting unless the source record states it.

## Useful MCP tools

- `search_resources`: faceted catalogue search.
- `get_resource`: full record by ID or slug.
- `list_data_types`: available contribution data types.
- `list_countries`: represented availability regions.
- `get_stats`: catalogue-wide summary.
- `search` and `fetch`: citation-oriented retrieval.

## Licensing

The dataset is dedicated to the public domain under CC0 1.0. Website prose and source code have separate licences; inspect the relevant licence page before republishing them.
