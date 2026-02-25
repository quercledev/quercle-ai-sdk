# @quercle/ai-sdk

Quercle web search and fetch tools for the [Vercel AI SDK](https://sdk.vercel.ai/).

## Installation

```bash
bun add @quercle/ai-sdk
# or
npm install @quercle/ai-sdk
```

## Setup

Set your API key as an environment variable:

```bash
export QUERCLE_API_KEY=qk_...
```

Get your API key at [quercle.dev](https://quercle.dev).

## Tools

| Tool | Description | Parameters |
|---|---|---|
| `quercleSearch` | Search the web and get AI-synthesized answers with citations | `query`, `allowedDomains?`, `blockedDomains?` |
| `quercleFetch` | Fetch a URL and analyze its content with AI | `url`, `prompt` |
| `quercleRawSearch` | Raw web search results without AI synthesis | `query`, `format?` (`markdown` \| `json`), `useSafeguard?` |
| `quercleRawFetch` | Fetch raw page content without AI processing | `url`, `format?` (`markdown` \| `html`), `useSafeguard?` |
| `quercleExtract` | Extract content relevant to a query from a URL | `url`, `query`, `format?` (`markdown` \| `json`), `useSafeguard?` |

## Quick Start

```ts
import { quercleSearch, quercleFetch, quercleRawSearch, quercleRawFetch, quercleExtract } from "@quercle/ai-sdk";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const { text } = await generateText({
  model: openai("gpt-4o"),
  tools: { quercleSearch, quercleFetch, quercleRawSearch, quercleRawFetch, quercleExtract },
  maxSteps: 5,
  prompt: "Search for the latest news about AI agents and summarize what you find",
});

console.log(text);
```

## Direct Tool Usage

Use the tools directly without an LLM:

```ts
import { quercleSearch, quercleFetch, quercleRawSearch, quercleRawFetch, quercleExtract } from "@quercle/ai-sdk";

// Search with AI-synthesized answer
const searchResult = await quercleSearch.execute(
  { query: "best practices for building AI agents" },
  { toolCallId: "1", messages: [] },
);
console.log(searchResult);

// Search with domain filtering
const filtered = await quercleSearch.execute(
  {
    query: "TypeScript documentation",
    allowedDomains: ["typescriptlang.org"],
  },
  { toolCallId: "2", messages: [] },
);

// Fetch and analyze a page
const fetchResult = await quercleFetch.execute(
  {
    url: "https://en.wikipedia.org/wiki/TypeScript",
    prompt: "Summarize the key features of TypeScript",
  },
  { toolCallId: "3", messages: [] },
);
console.log(fetchResult);

// Raw search results (markdown or JSON)
const rawResults = await quercleRawSearch.execute(
  { query: "TypeScript 5 features", format: "json" },
  { toolCallId: "4", messages: [] },
);
console.log(rawResults);

// Raw page content
const rawPage = await quercleRawFetch.execute(
  { url: "https://en.wikipedia.org/wiki/TypeScript", format: "markdown" },
  { toolCallId: "5", messages: [] },
);
console.log(rawPage);

// Extract relevant content from a page
const extracted = await quercleExtract.execute(
  {
    url: "https://en.wikipedia.org/wiki/TypeScript",
    query: "type system features",
    format: "markdown",
  },
  { toolCallId: "6", messages: [] },
);
console.log(extracted);
```

### Custom API Key

```ts
import { createQuercleTools } from "@quercle/ai-sdk";

const { quercleSearch, quercleFetch, quercleRawSearch, quercleRawFetch, quercleExtract } = createQuercleTools({
  apiKey: "qk_...",
});
```

## Agentic Usage

### Multi-Step with generateText

```ts
import { quercleSearch, quercleFetch, quercleExtract } from "@quercle/ai-sdk";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const { text, steps } = await generateText({
  model: anthropic("claude-sonnet-4-20250514"),
  tools: { quercleSearch, quercleFetch, quercleExtract },
  maxSteps: 10,
  prompt: "Research the latest developments in WebAssembly and write a summary",
  onStepFinish({ text, toolCalls, finishReason }) {
    console.log("Step finished:", finishReason, toolCalls.length, "tool calls");
  },
});

console.log(text);
console.log(`Completed in ${steps.length} steps`);
```

### Streaming with streamText

```ts
import { quercleSearch, quercleFetch } from "@quercle/ai-sdk";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

const result = streamText({
  model: openai("gpt-4o"),
  tools: { quercleSearch, quercleFetch },
  maxSteps: 5,
  prompt: "Find and summarize the top 3 trending AI papers this week",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

## API Reference

| Export | Description |
|---|---|
| `quercleSearch` | AI SDK tool for web search with AI-synthesized answers (uses `QUERCLE_API_KEY` env var) |
| `quercleFetch` | AI SDK tool for URL fetch + AI analysis (uses `QUERCLE_API_KEY` env var) |
| `quercleRawSearch` | AI SDK tool for raw web search results (uses `QUERCLE_API_KEY` env var) |
| `quercleRawFetch` | AI SDK tool for raw page content fetching (uses `QUERCLE_API_KEY` env var) |
| `quercleExtract` | AI SDK tool for extracting relevant content from a URL (uses `QUERCLE_API_KEY` env var) |
| `createQuercleTools(options?)` | Factory that returns all 5 tools with a custom API key or config |

## License

MIT
