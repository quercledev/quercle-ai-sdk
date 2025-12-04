# @quercle/ai-sdk

Quercle web tools for the [Vercel AI SDK](https://sdk.vercel.ai/).

Provides `quercleSearch` and `quercleFetch` tools that integrate seamlessly with AI applications built on the Vercel AI SDK.

## Installation

```bash
bun add @quercle/ai-sdk
```

```bash
npm install @quercle/ai-sdk
```

## Setup

Set your Quercle API key as an environment variable:

```bash
export QUERCLE_API_KEY=qk_...
```

Get your API key at [quercle.dev](https://quercle.dev).

## Usage

### With generateText

```typescript
import { quercleSearch, quercleFetch } from "@quercle/ai-sdk";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const result = await generateText({
  model: openai("gpt-4o"),
  tools: { quercleSearch, quercleFetch },
  prompt: "Search for the latest news about AI and summarize",
});
```

### With streamText

```typescript
import { quercleSearch, quercleFetch } from "@quercle/ai-sdk";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

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
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const { quercleSearch, quercleFetch } = createQuercleTools({
  apiKey: "qk_...",
});

const result = await generateText({
  model: openai("gpt-4o"),
  tools: { quercleSearch, quercleFetch },
  prompt: "Search for TypeScript best practices",
});
```

## Tools

### quercleSearch

Search the web and get AI-synthesized answers with citations.

**Parameters:**
- `query` (string, required): The search query
- `allowedDomains` (string[], optional): Only include results from these domains
- `blockedDomains` (string[], optional): Exclude results from these domains

### quercleFetch

Fetch a URL and analyze its content with AI.

**Parameters:**
- `url` (string, required): The URL to fetch
- `prompt` (string, required): Instructions for how to analyze the content

## License

MIT
