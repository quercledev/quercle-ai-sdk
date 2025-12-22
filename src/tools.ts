import { tool } from "ai";
import {
  QuercleClient,
  TOOL_DESCRIPTIONS,
  searchToolSchema,
  fetchToolSchema,
  type QuercleConfig,
  type SearchToolInput,
  type FetchToolInput,
} from "@quercle/sdk";

/**
 * Search the web using Quercle and get AI-synthesized answers with citations.
 *
 * Uses the QUERCLE_API_KEY environment variable for authentication.
 *
 * @example
 * ```typescript
 * import { quercleSearch } from "@quercle/ai-sdk";
 * import { generateText } from "ai";
 * import { openai } from "@ai-sdk/openai";
 *
 * const result = await generateText({
 *   model: openai("gpt-4"),
 *   tools: { quercleSearch },
 *   prompt: "Search for the latest news about AI",
 * });
 * ```
 */
export const quercleSearch = tool<SearchToolInput, string>({
  description: TOOL_DESCRIPTIONS.SEARCH,
  inputSchema: searchToolSchema,
  execute: async ({ query, allowedDomains, blockedDomains }) => {
    const client = new QuercleClient();
    return await client.search(query, { allowedDomains, blockedDomains });
  },
});

/**
 * Fetch a URL and analyze its content with AI using Quercle.
 *
 * Uses the QUERCLE_API_KEY environment variable for authentication.
 *
 * @example
 * ```typescript
 * import { quercleFetch } from "@quercle/ai-sdk";
 * import { generateText } from "ai";
 * import { openai } from "@ai-sdk/openai";
 *
 * const result = await generateText({
 *   model: openai("gpt-4"),
 *   tools: { quercleFetch },
 *   prompt: "Fetch https://example.com and summarize its content",
 * });
 * ```
 */
export const quercleFetch = tool<FetchToolInput, string>({
  description: TOOL_DESCRIPTIONS.FETCH,
  inputSchema: fetchToolSchema,
  execute: async ({ url, prompt }) => {
    const client = new QuercleClient();
    return await client.fetch(url, prompt);
  },
});

/**
 * Create Quercle tools with custom configuration.
 *
 * Use this when you need to provide a custom API key instead of
 * using the QUERCLE_API_KEY environment variable.
 *
 * @example
 * ```typescript
 * import { createQuercleTools } from "@quercle/ai-sdk";
 * import { generateText } from "ai";
 * import { openai } from "@ai-sdk/openai";
 *
 * const { quercleSearch, quercleFetch } = createQuercleTools({
 *   apiKey: "qk_...",
 * });
 *
 * const result = await generateText({
 *   model: openai("gpt-4"),
 *   tools: { quercleSearch, quercleFetch },
 *   prompt: "Search for TypeScript best practices",
 * });
 * ```
 */
export function createQuercleTools(config?: QuercleConfig) {
  const client = new QuercleClient(config);

  return {
    quercleSearch: tool<SearchToolInput, string>({
      description: TOOL_DESCRIPTIONS.SEARCH,
      inputSchema: searchToolSchema,
      execute: async ({ query, allowedDomains, blockedDomains }) => {
        return await client.search(query, { allowedDomains, blockedDomains });
      },
    }),
    quercleFetch: tool<FetchToolInput, string>({
      description: TOOL_DESCRIPTIONS.FETCH,
      inputSchema: fetchToolSchema,
      execute: async ({ url, prompt }) => {
        return await client.fetch(url, prompt);
      },
    }),
  };
}
