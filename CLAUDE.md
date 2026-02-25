# CLAUDE.md - Quercle Vercel AI SDK Integration

## Project Overview

TypeScript package integrating Quercle web tools with Vercel AI SDK. Provides 5 tools (`quercleSearch`, `quercleFetch`, `quercleRawSearch`, `quercleRawFetch`, `quercleExtract`) using the AI SDK's `tool()` function.

## Development Guidelines

**IMPORTANT:**
- Always use the **latest stable versions** of all dependencies
- Use **`bun`** for package management (NOT npm/yarn)
- Use modern TypeScript patterns and strict types
- Check npm for current versions before specifying dependencies

## Quercle API

### Authentication
- Header: `Authorization: Bearer qk_...`
- Env var: `QUERCLE_API_KEY`

### Endpoints

**POST https://api.quercle.dev/v1/search**
```json
// Request
{"query": "...", "allowed_domains": ["*.edu"], "blocked_domains": ["spam.com"]}
// Response
{"result": "Synthesized answer with [1] citations...\n\nSources:\n[1] Title - URL"}
```

**POST https://api.quercle.dev/v1/fetch**
```json
// Request
{"url": "https://...", "prompt": "Summarize this page"}
// Response
{"result": "AI-processed content..."}
```

**POST https://api.quercle.dev/v1/raw_search**
```json
// Request
{"query": "...", "format": "markdown", "use_safeguard": false}
// Response
{"result": "Raw search results...", "unsafe": false}
```

**POST https://api.quercle.dev/v1/raw_fetch**
```json
// Request
{"url": "https://...", "format": "markdown", "use_safeguard": false}
// Response
{"result": "Raw page content...", "unsafe": false}
```

**POST https://api.quercle.dev/v1/extract**
```json
// Request
{"url": "https://...", "query": "pricing info", "format": "markdown", "use_safeguard": false}
// Response
{"result": "Extracted chunks...", "unsafe": false}
```

## Package Structure

```
src/
├── index.ts             # Exports all 5 tools + createQuercleTools + re-exported SDK types
├── tools.ts             # AI SDK tool() definitions with Zod schemas
└── tools.test.ts        # Unit tests
dist/                    # Compiled output
package.json
tsconfig.json
README.md
LICENSE                  # MIT
```

## Tool Implementation

Uses `@quercle/sdk` for client and `toolMetadata` for descriptions. Zod schemas are defined locally in `tools.ts`.

```typescript
import { tool } from "ai";
import { QuercleClient, toolMetadata, type QuercleClientOptions } from "@quercle/sdk";
import { z } from "zod";

// Zod schemas defined locally using toolMetadata for parameter descriptions
const searchToolSchema = z.object({
  query: z.string().describe(toolMetadata.search.parameters.query),
  allowedDomains: z.array(z.string()).optional().describe(toolMetadata.search.parameters.allowed_domains),
  blockedDomains: z.array(z.string()).optional().describe(toolMetadata.search.parameters.blocked_domains),
});

// Shared default client, lazily initialized
let _defaultClient: QuercleClient | undefined;
function getDefaultClient(): QuercleClient {
  if (!_defaultClient) _defaultClient = new QuercleClient();
  return _defaultClient;
}

export const quercleSearch = tool({
  description: toolMetadata.search.description,
  inputSchema: searchToolSchema,
  execute: async ({ query, allowedDomains, blockedDomains }) => {
    return (await getDefaultClient().search(query, { allowedDomains, blockedDomains })).result;
  },
});
```

### All 5 Tools

| Tool | Description | Client method | Returns |
|------|-------------|---------------|---------|
| `quercleSearch` | AI-synthesized search with citations | `client.search()` | `.result` (string) |
| `quercleFetch` | Fetch URL + AI analysis | `client.fetch()` | `.result` (string) |
| `quercleRawSearch` | Raw web search results | `client.rawSearch()` | `formatRawResult(.result, .unsafe)` |
| `quercleRawFetch` | Raw URL content (markdown/HTML) | `client.rawFetch()` | `formatRawResult(.result, .unsafe)` |
| `quercleExtract` | Extract relevant chunks from URL | `client.extract()` | `formatRawResult(.result, .unsafe)` |

Raw/extract tools use `formatRawResult()` which prefixes `[UNSAFE] ` when the response is flagged.

## Commands

```bash
bun install              # Install deps
bun run build           # Build TypeScript
bun run test            # Run tests
bun run lint            # Lint with ESLint
bun publish             # Publish to npm
```

## Dependencies

- @quercle/sdk ^1.0.0 (client, toolMetadata)
- ai >= 5.0.0 (AI SDK v5+)
- zod ^3.x
- TypeScript 5+

## Usage Example

```typescript
import {
  quercleSearch,
  quercleFetch,
  quercleRawSearch,
  quercleRawFetch,
  quercleExtract,
} from "@quercle/ai-sdk";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Use all 5 tools with generateText
const result = await generateText({
  model: openai("gpt-4o"),
  tools: { quercleSearch, quercleFetch, quercleRawSearch, quercleRawFetch, quercleExtract },
  prompt: "Search for the latest news about AI and summarize",
});

// Use with streamText
import { streamText } from "ai";

const stream = streamText({
  model: openai("gpt-4o"),
  tools: { quercleSearch, quercleFetch, quercleRawSearch, quercleRawFetch, quercleExtract },
  prompt: "Find information about TypeScript 5",
});

for await (const chunk of stream.textStream) {
  console.log(chunk);
}
```

### With Custom API Key

```typescript
import { createQuercleTools } from "@quercle/ai-sdk";

const { quercleSearch, quercleFetch, quercleRawSearch, quercleRawFetch, quercleExtract } =
  createQuercleTools({ apiKey: "qk_..." });
```

## Publishing

- Package name on npm: `@quercle/ai-sdk`
- Use npm OIDC with GitHub Actions
