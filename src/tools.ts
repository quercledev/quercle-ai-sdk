import { tool } from "ai";
import {
  QuercleClient,
  toolMetadata,
  type QuercleClientOptions,
} from "@quercle/sdk";
import { z } from "zod";

const searchToolSchema = z.object({
  query: z.string().describe(toolMetadata.search.parameters.query),
  allowedDomains: z.array(z.string()).optional().describe(toolMetadata.search.parameters.allowed_domains),
  blockedDomains: z.array(z.string()).optional().describe(toolMetadata.search.parameters.blocked_domains),
});

const fetchToolSchema = z.object({
  url: z.string().describe(toolMetadata.fetch.parameters.url),
  prompt: z.string().describe(toolMetadata.fetch.parameters.prompt),
});

const rawSearchToolSchema = z.object({
  query: z.string().describe(toolMetadata.rawSearch.parameters.query),
  format: z.enum(["markdown", "json"]).optional().describe(toolMetadata.rawSearch.parameters.format),
  useSafeguard: z.boolean().optional().describe(toolMetadata.rawSearch.parameters.use_safeguard),
});

const rawFetchToolSchema = z.object({
  url: z.string().describe(toolMetadata.rawFetch.parameters.url),
  format: z.enum(["markdown", "html"]).optional().describe(toolMetadata.rawFetch.parameters.format),
  useSafeguard: z.boolean().optional().describe(toolMetadata.rawFetch.parameters.use_safeguard),
});

const extractToolSchema = z.object({
  url: z.string().describe(toolMetadata.extract.parameters.url),
  query: z.string().describe(toolMetadata.extract.parameters.query),
  format: z.enum(["markdown", "json"]).optional().describe(toolMetadata.extract.parameters.format),
  useSafeguard: z.boolean().optional().describe(toolMetadata.extract.parameters.use_safeguard),
});

type SearchToolInput = z.infer<typeof searchToolSchema>;
type FetchToolInput = z.infer<typeof fetchToolSchema>;
type RawSearchToolInput = z.infer<typeof rawSearchToolSchema>;
type RawFetchToolInput = z.infer<typeof rawFetchToolSchema>;
type ExtractToolInput = z.infer<typeof extractToolSchema>;

/**
 * Format a raw/extract response result as a string.
 *
 * If the result is already a string it is returned directly.
 * If it is an array it is JSON-stringified.
 * When the response is flagged as unsafe, the string is prefixed with "[UNSAFE] ".
 */
function formatRawResult(result: string | unknown[], unsafe?: boolean): string {
  const text = typeof result === "string" ? result : JSON.stringify(result);
  return unsafe ? `[UNSAFE] ${text}` : text;
}

/** Shared default client instance, lazily initialized on first use. */
let _defaultClient: QuercleClient | undefined;
function getDefaultClient(): QuercleClient {
  if (!_defaultClient) {
    _defaultClient = new QuercleClient();
  }
  return _defaultClient;
}

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
  description: toolMetadata.search.description,
  inputSchema: searchToolSchema,
  execute: async ({ query, allowedDomains, blockedDomains }) => {
    return (await getDefaultClient().search(query, { allowedDomains, blockedDomains })).result;
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
  description: toolMetadata.fetch.description,
  inputSchema: fetchToolSchema,
  execute: async ({ url, prompt }) => {
    return (await getDefaultClient().fetch(url, prompt)).result;
  },
});

/**
 * Run a web search using Quercle and return raw results.
 *
 * Uses the QUERCLE_API_KEY environment variable for authentication.
 *
 * @example
 * ```typescript
 * import { quercleRawSearch } from "@quercle/ai-sdk";
 * import { generateText } from "ai";
 * import { openai } from "@ai-sdk/openai";
 *
 * const result = await generateText({
 *   model: openai("gpt-4"),
 *   tools: { quercleRawSearch },
 *   prompt: "Search for the latest news about AI",
 * });
 * ```
 */
export const quercleRawSearch = tool<RawSearchToolInput, string>({
  description: toolMetadata.rawSearch.description,
  inputSchema: rawSearchToolSchema,
  execute: async ({ query, format, useSafeguard }) => {
    const response = await getDefaultClient().rawSearch(query, { format, useSafeguard });
    return formatRawResult(response.result, response.unsafe);
  },
});

/**
 * Fetch a URL using Quercle and return raw markdown or HTML.
 *
 * Uses the QUERCLE_API_KEY environment variable for authentication.
 *
 * @example
 * ```typescript
 * import { quercleRawFetch } from "@quercle/ai-sdk";
 * import { generateText } from "ai";
 * import { openai } from "@ai-sdk/openai";
 *
 * const result = await generateText({
 *   model: openai("gpt-4"),
 *   tools: { quercleRawFetch },
 *   prompt: "Fetch https://example.com and return its content",
 * });
 * ```
 */
export const quercleRawFetch = tool<RawFetchToolInput, string>({
  description: toolMetadata.rawFetch.description,
  inputSchema: rawFetchToolSchema,
  execute: async ({ url, format, useSafeguard }) => {
    const response = await getDefaultClient().rawFetch(url, { format, useSafeguard });
    return formatRawResult(response.result, response.unsafe);
  },
});

/**
 * Fetch a URL using Quercle and return chunks relevant to a query.
 *
 * Uses the QUERCLE_API_KEY environment variable for authentication.
 *
 * @example
 * ```typescript
 * import { quercleExtract } from "@quercle/ai-sdk";
 * import { generateText } from "ai";
 * import { openai } from "@ai-sdk/openai";
 *
 * const result = await generateText({
 *   model: openai("gpt-4"),
 *   tools: { quercleExtract },
 *   prompt: "Extract pricing info from https://example.com",
 * });
 * ```
 */
export const quercleExtract = tool<ExtractToolInput, string>({
  description: toolMetadata.extract.description,
  inputSchema: extractToolSchema,
  execute: async ({ url, query, format, useSafeguard }) => {
    const response = await getDefaultClient().extract(url, query, { format, useSafeguard });
    return formatRawResult(response.result, response.unsafe);
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
 * const { quercleSearch, quercleFetch, quercleRawSearch, quercleRawFetch, quercleExtract } = createQuercleTools({
 *   apiKey: "qk_...",
 * });
 *
 * const result = await generateText({
 *   model: openai("gpt-4"),
 *   tools: { quercleSearch, quercleFetch, quercleRawSearch, quercleRawFetch, quercleExtract },
 *   prompt: "Search for TypeScript best practices",
 * });
 * ```
 */
export function createQuercleTools(config?: QuercleClientOptions) {
  const client = new QuercleClient(config);

  return {
    quercleSearch: tool<SearchToolInput, string>({
      description: toolMetadata.search.description,
      inputSchema: searchToolSchema,
      execute: async ({ query, allowedDomains, blockedDomains }) => {
        return (await client.search(query, { allowedDomains, blockedDomains })).result;
      },
    }),
    quercleFetch: tool<FetchToolInput, string>({
      description: toolMetadata.fetch.description,
      inputSchema: fetchToolSchema,
      execute: async ({ url, prompt }) => {
        return (await client.fetch(url, prompt)).result;
      },
    }),
    quercleRawSearch: tool<RawSearchToolInput, string>({
      description: toolMetadata.rawSearch.description,
      inputSchema: rawSearchToolSchema,
      execute: async ({ query, format, useSafeguard }) => {
        const response = await client.rawSearch(query, { format, useSafeguard });
        return formatRawResult(response.result, response.unsafe);
      },
    }),
    quercleRawFetch: tool<RawFetchToolInput, string>({
      description: toolMetadata.rawFetch.description,
      inputSchema: rawFetchToolSchema,
      execute: async ({ url, format, useSafeguard }) => {
        const response = await client.rawFetch(url, { format, useSafeguard });
        return formatRawResult(response.result, response.unsafe);
      },
    }),
    quercleExtract: tool<ExtractToolInput, string>({
      description: toolMetadata.extract.description,
      inputSchema: extractToolSchema,
      execute: async ({ url, query, format, useSafeguard }) => {
        const response = await client.extract(url, query, { format, useSafeguard });
        return formatRawResult(response.result, response.unsafe);
      },
    }),
  };
}
