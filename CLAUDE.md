# CLAUDE.md - Quercle Vercel AI SDK Integration

## Project Overview

TypeScript package integrating Quercle web tools with Vercel AI SDK. Provides `quercleSearch` and `quercleFetch` tools using the AI SDK's `tool()` function.

## Development Guidelines

**IMPORTANT:**
- Always use the **latest stable versions** of all dependencies
- Use **`bun`** for package management (NOT npm/yarn)
- Use modern TypeScript patterns and strict types
- Check npm for current versions before specifying dependencies

## Quercle API

### Authentication
- Header: `X-API-Key: qk_...`
- Env var: `QUERCLE_API_KEY`

### Endpoints

**POST https://api.quercle.dev/v1/fetch**
```json
// Request
{"url": "https://...", "prompt": "Summarize this page"}
// Response
{"result": "AI-processed content..."}
```

**POST https://api.quercle.dev/v1/search**
```json
// Request
{"query": "...", "allowed_domains": ["*.edu"], "blocked_domains": ["spam.com"]}
// Response
{"result": "Synthesized answer with [1] citations...\n\nSources:\n[1] Title - URL"}
```

## Package Structure

```
src/
├── index.ts             # Exports quercleSearch, quercleFetch, createQuercleTools
├── tools.ts             # AI SDK tool() definitions
└── tools.test.ts        # Unit tests
dist/                    # Compiled output
package.json
tsconfig.json
README.md
LICENSE                  # MIT
```

## Tool Implementation

Uses `@quercle/sdk` for client, schemas, and descriptions:

```typescript
import { tool } from "ai";
import {
  QuercleClient,
  TOOL_DESCRIPTIONS,
  searchToolSchema,
  fetchToolSchema,
} from "@quercle/sdk";

export const quercleSearch = tool({
  description: TOOL_DESCRIPTIONS.SEARCH,
  inputSchema: searchToolSchema,  // AI SDK v5 uses inputSchema
  execute: async ({ query, allowedDomains, blockedDomains }) => {
    const client = new QuercleClient();
    return await client.search(query, { allowedDomains, blockedDomains });
  },
});

export const quercleFetch = tool({
  description: TOOL_DESCRIPTIONS.FETCH,
  inputSchema: fetchToolSchema,  // AI SDK v5 uses inputSchema
  execute: async ({ url, prompt }) => {
    const client = new QuercleClient();
    return await client.fetch(url, prompt);
  },
});
```

## Commands

```bash
bun install              # Install deps
bun run build           # Build TypeScript
bun run test            # Run tests
bun run lint            # Lint with ESLint
bun publish             # Publish to npm
```

## Dependencies

- @quercle/sdk (client, schemas, descriptions)
- ai >= 5.0.0 (AI SDK v5+)
- zod
- TypeScript 5+

## Usage Example

```typescript
import { quercleSearch, quercleFetch } from "@quercle/ai-sdk";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Use with generateText
const result = await generateText({
  model: openai("gpt-4o"),
  tools: { quercleSearch, quercleFetch },
  prompt: "Search for the latest news about AI and summarize",
});

// Use with streamText
import { streamText } from "ai";

const stream = streamText({
  model: openai("gpt-4o"),
  tools: { quercleSearch, quercleFetch },
  prompt: "Find information about TypeScript 5",
});

for await (const chunk of stream.textStream) {
  console.log(chunk);
}
```

### With Custom API Key

```typescript
import { createQuercleTools } from "@quercle/ai-sdk";

const { quercleSearch, quercleFetch } = createQuercleTools({
  apiKey: "qk_...",
});
```

## Publishing

- Package name on npm: `@quercle/ai-sdk`
- Use npm OIDC with GitHub Actions
