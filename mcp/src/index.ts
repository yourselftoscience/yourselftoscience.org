/**
 * Yourself to Science — Remote MCP Server (Cloudflare Worker)
 * ----------------------------------------------------------------------------
 * One server that plugs into Claude (Connectors), ChatGPT (Apps SDK), and
 * Gemini — because all three speak MCP. Public, read-only, AUTHLESS: your data
 * is CC0, so there is no OAuth flow and no reviewer test account needed, which
 * removes the biggest source of directory-submission friction.
 *
 * Data source: your own public endpoint https://yourselftoscience.org/resources.json
 * (fetched + edge-cached). Nothing to host or sync; it's always fresh.
 *
 * License suggestion: AGPL-3.0 to match your platform code.
 *
 * ============================================================================
 * SETUP  (run these once)
 * ============================================================================
 *   npm create cloudflare@latest yts-mcp -- \
 *       --template=cloudflare/ai/demos/remote-mcp-server-authless
 *   cd yts-mcp
 *   npm i agents @modelcontextprotocol/sdk zod
 *   # replace src/index.ts with this file
 *   npx wrangler deploy            # -> https://yts-mcp.<account>.workers.dev/mcp
 *
 * wrangler.jsonc (the authless template ships most of this; ensure it matches):
 * {
 *   "name": "yts-mcp",
 *   "main": "src/index.ts",
 *   "compatibility_date": "2026-01-01",
 *   "compatibility_flags": ["nodejs_compat"],
 *   "durable_objects": {
 *     "bindings": [{ "name": "MCP_OBJECT", "class_name": "YourselfToScienceMCP" }]
 *   },
 *   "migrations": [{ "tag": "v1", "new_sqlite_classes": ["YourselfToScienceMCP"] }]
 *   // Optional GDPR data residency: "placement": { "mode": "smart" } and/or
 *   // pin the Durable Object jurisdiction to "eu" per Cloudflare docs.
 * }
 *
 * ============================================================================
 * TEST
 * ============================================================================
 *   - MCP Inspector:        npx @modelcontextprotocol/inspector   (point at /mcp)
 *   - Claude:               Settings -> Connectors -> Add custom connector -> URL
 *   - ChatGPT (dev mode):   Settings -> Connectors -> add the same /mcp URL
 *   - Gemini CLI:           add the URL to your MCP server config
 *
 * SUBMIT (each is a form; the server is identical)
 *   - Anthropic: submit in-app via the Connectors directory
 *   - OpenAI:    submit to the ChatGPT app directory (review the app guidelines)
 *
 * NOTE: MCP SDK / agents APIs move fast. If a signature below has drifted,
 * check developers.cloudflare.com/agents and the @modelcontextprotocol/sdk README.
 */

import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// ----------------------------------------------------------------------------
// Types (subset of your published schema)
// ----------------------------------------------------------------------------
interface Organization {
  name: string;
  wikidataId?: string;
  rorId?: string;        // ROR is nested PER ORGANIZATION in the live data
  rorName?: string;
  rorTypes?: string[];
}
interface Resource {
  id: string;
  permalink?: string;
  slug: string;
  title: string;
  organizations?: Organization[];
  link?: string;
  dataTypes?: string[];
  compensationType?: "donation" | "payment" | "mixed" | string;
  origin?: string;
  macroCategories?: string[];    // top-level grouping, e.g. "Health & Digital Data"
  countries?: string[];          // NOTE: absent on many records -> treat as Worldwide
  locations?: string[];
  excludedCountries?: string[];
  description?: string;
  entityCategory?: string;       // org type: Commercial / Non-Profit / Academic / Government
  entitySubType?: string;
  resourceWikidataId?: string;
  isCitedOnWikidata?: boolean;
  wikidataReferenceUrl?: string;
}

// ----------------------------------------------------------------------------
// Data loading (edge-cached; trivial in-isolate cache as a second layer)
// ----------------------------------------------------------------------------
const DATA_URL = "https://yourselftoscience.org/resources.json";
const TTL_MS = 30 * 60 * 1000;
let cache: { at: number; data: Resource[] } | null = null;

async function loadResources(): Promise<Resource[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  const res = await fetch(DATA_URL, { cf: { cacheTtl: 1800, cacheEverything: true } });
  if (!res.ok) throw new Error(`Failed to load dataset: ${res.status}`);
  const data = (await res.json()) as Resource[];
  cache = { at: Date.now(), data };
  return data;
}

const lc = (s?: string) => (s ?? "").toLowerCase();

function availableIn(r: Resource): string[] {
  // Many records omit `countries`; the site treats that as Worldwide.
  const list = r.countries ?? r.locations ?? [];
  return list.length ? list : ["Worldwide"];
}

function matches(r: Resource, f: {
  query?: string; dataType?: string; country?: string;
  compensationType?: string; category?: string; macroCategory?: string;
}): boolean {
  if (f.query) {
    const q = lc(f.query);
    const hay = [
      r.title, r.description, ...(r.dataTypes ?? []),
      ...(r.organizations?.map((o) => o.name) ?? []), ...availableIn(r), ...(r.macroCategories ?? []),
    ].map(lc).join(" ");
    if (!hay.includes(q)) return false;
  }
  if (f.dataType && !(r.dataTypes ?? []).some((d) => lc(d).includes(lc(f.dataType)))) return false;
  if (f.country) {
    if ((r.excludedCountries ?? []).map(lc).includes(lc(f.country))) return false;
    const avail = availableIn(r).map(lc);
    if (!(avail.includes("worldwide") || avail.some((c) => c.includes(lc(f.country))))) return false;
  }
  if (f.compensationType && lc(r.compensationType) !== lc(f.compensationType)) return false;
  if (f.category && !lc(r.entityCategory).includes(lc(f.category))) return false;
  if (f.macroCategory && !(r.macroCategories ?? []).some((m) => lc(m).includes(lc(f.macroCategory)))) return false;
  return true;
}

// Trim each hit so a full search result stays well under the 25k-token cap.
function brief(r: Resource) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    organizations: r.organizations?.map((o) => o.name),
    dataTypes: r.dataTypes,
    compensationType: r.compensationType,
    countries: r.countries,
    entityCategory: r.entityCategory,
    url: r.permalink ?? r.link,
  };
}

const text = (obj: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }] });

// ----------------------------------------------------------------------------
// MCP server
// ----------------------------------------------------------------------------
export class YourselfToScienceMCP extends McpAgent {
  server = new McpServer({ name: "yourself-to-science", version: "1.0.0" });

  async init() {
    const RO = { readOnlyHint: true, openWorldHint: true } as const;

    // --- Domain tools --------------------------------------------------------
    this.server.registerTool(
      "search_resources",
      {
        title: "Search research-participation opportunities",
        description:
          "Search the Yourself to Science catalogue of clinical trials, registries, " +
          "biobanks, and data/sample donation programs. Filter by data type (e.g. " +
          "Genome, Health data, Stool, Body), country, compensation (donation, payment, " +
          "mixed), and organization category. Returns brief records; use get_resource for full detail.",
        inputSchema: {
          query: z.string().optional().describe("Free-text search across title, description, org, country, data type"),
          dataType: z.string().optional().describe('e.g. "Genome", "Wearable data", "Tissue"'),
          country: z.string().optional().describe('e.g. "Italy", "United States", "Worldwide"'),
          compensationType: z.string().optional().describe('"donation" | "payment" | "mixed"'),
          category: z.string().optional().describe('e.g. "Government", "Non-Profit", "Commercial"'),
          limit: z.number().int().min(1).max(50).default(20),
        },
        annotations: RO,
      },
      async (args) => {
        const all = await loadResources();
        const hits = all.filter((r) => matches(r, args)).slice(0, args.limit ?? 20);
        return text({ count: hits.length, results: hits.map(brief) });
      }
    );

    this.server.registerTool(
      "get_resource",
      {
        title: "Get full resource detail",
        description: "Return the complete record for one resource by its id or slug.",
        inputSchema: { idOrSlug: z.string().describe("Resource id (UUID) or slug") },
        annotations: RO,
      },
      async ({ idOrSlug }) => {
        const all = await loadResources();
        const r = all.find((x) => x.id === idOrSlug || x.slug === idOrSlug);
        return r ? text(r) : text({ error: "not_found", idOrSlug });
      }
    );

    this.server.registerTool(
      "list_data_types",
      { title: "List data types", description: "All distinct data types in the catalogue, with counts.", inputSchema: {}, annotations: RO },
      async () => {
        const all = await loadResources();
        const counts: Record<string, number> = {};
        for (const r of all) for (const d of r.dataTypes ?? []) counts[d] = (counts[d] ?? 0) + 1;
        return text(Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })));
      }
    );

    this.server.registerTool(
      "list_countries",
      { title: "List countries", description: "All distinct countries where resources are available, with counts.", inputSchema: {}, annotations: RO },
      async () => {
        const all = await loadResources();
        const counts: Record<string, number> = {};
        for (const r of all) for (const c of r.countries ?? []) counts[c] = (counts[c] ?? 0) + 1;
        return text(Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })));
      }
    );

    this.server.registerTool(
      "get_stats",
      { title: "Catalogue statistics", description: "High-level landscape stats: totals by compensation type, category, and data type.", inputSchema: {}, annotations: RO },
      async () => {
        const all = await loadResources();
        const tally = (key: (r: Resource) => string | undefined) => {
          const c: Record<string, number> = {};
          for (const r of all) { const k = key(r); if (k) c[k] = (c[k] ?? 0) + 1; }
          return c;
        };
        return text({
          totalResources: all.length,
          byCompensation: tally((r) => r.compensationType),
          byCategory: tally((r) => r.entityCategory),
        });
      }
    );

    // --- Portability pair: OpenAI deep-research / "company knowledge" --------
    // These exact tool names + input shapes are what ChatGPT's deep research and
    // company-knowledge features look for. Implementing them turns your catalogue
    // into a citable source inside ChatGPT. Keep the I/O shape close to OpenAI's
    // MCP docs (verify current field names there).
    this.server.registerTool(
      "search",
      {
        title: "Search (deep-research compatible)",
        description: "Search the catalogue. Returns a list of {id, title, url} for retrieval via fetch.",
        inputSchema: { query: z.string() },
        annotations: RO,
      },
      async ({ query }) => {
        const all = await loadResources();
        const hits = all.filter((r) => matches(r, { query })).slice(0, 20);
        return text({ results: hits.map((r) => ({ id: r.id, title: r.title, url: r.permalink ?? r.link })) });
      }
    );

    this.server.registerTool(
      "fetch",
      {
        title: "Fetch (deep-research compatible)",
        description: "Fetch a single document by id, returning text + metadata for citation.",
        inputSchema: { id: z.string() },
        annotations: RO,
      },
      async ({ id }) => {
        const all = await loadResources();
        const r = all.find((x) => x.id === id || x.slug === id);
        if (!r) return text({ error: "not_found", id });
        const body =
          `${r.title}\n\n${r.description ?? ""}\n\n` +
          `Organizations: ${(r.organizations ?? []).map((o) => o.name).join(", ")}\n` +
          `Data types: ${(r.dataTypes ?? []).join(", ")}\n` +
          `Available in: ${(r.countries ?? []).join(", ")}\n` +
          `Compensation: ${r.compensationType ?? "n/a"}\n` +
          `Category: ${r.entityCategory ?? "n/a"}`;
        return text({
          id: r.id,
          title: r.title,
          text: body,
          url: r.permalink ?? r.link,
          metadata: { wikidataId: r.resourceWikidataId, rorId: r.organizations?.[0]?.rorId },
        });
      }
    );
  }
}

// ----------------------------------------------------------------------------
// Worker entrypoint — route /mcp to the MCP server (Streamable HTTP).
// ----------------------------------------------------------------------------
export default {
  fetch(request: Request, env: unknown, ctx: ExecutionContext): Response | Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/mcp") {
      // McpAgent.serve() returns a fetch handler that speaks Streamable HTTP.
      return (YourselfToScienceMCP as any).serve("/mcp").fetch(request, env, ctx);
    }
    return new Response(
      "Yourself to Science — MCP server. Connect an MCP client to /mcp",
      { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } }
    );
  },
};
