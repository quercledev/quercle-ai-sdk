import { describe, expect, it } from "bun:test";
import { quercleSearch, quercleFetch, createQuercleTools } from "./tools.js";

describe("quercleSearch", () => {
  it("should have a description", () => {
    expect(quercleSearch.description).toBeDefined();
    expect(typeof quercleSearch.description).toBe("string");
    expect(quercleSearch.description.length).toBeGreaterThan(0);
  });

  it("should have inputSchema", () => {
    expect(quercleSearch.inputSchema).toBeDefined();
  });

  it("should have execute function", () => {
    expect(typeof quercleSearch.execute).toBe("function");
  });
});

describe("quercleFetch", () => {
  it("should have a description", () => {
    expect(quercleFetch.description).toBeDefined();
    expect(typeof quercleFetch.description).toBe("string");
    expect(quercleFetch.description.length).toBeGreaterThan(0);
  });

  it("should have inputSchema", () => {
    expect(quercleFetch.inputSchema).toBeDefined();
  });

  it("should have execute function", () => {
    expect(typeof quercleFetch.execute).toBe("function");
  });
});

describe("createQuercleTools", () => {
  // All tests use a test API key since QuercleClient requires one
  const testConfig = { apiKey: "qk_test_key" };

  it("should return quercleSearch and quercleFetch tools", () => {
    const tools = createQuercleTools(testConfig);
    expect(tools.quercleSearch).toBeDefined();
    expect(tools.quercleFetch).toBeDefined();
  });

  it("should return tools with execute functions", () => {
    const tools = createQuercleTools(testConfig);
    expect(typeof tools.quercleSearch.execute).toBe("function");
    expect(typeof tools.quercleFetch.execute).toBe("function");
  });

  it("should return tools with descriptions", () => {
    const tools = createQuercleTools(testConfig);
    expect(tools.quercleSearch.description).toBeDefined();
    expect(tools.quercleFetch.description).toBeDefined();
  });

  it("should return tools with inputSchema", () => {
    const tools = createQuercleTools(testConfig);
    expect(tools.quercleSearch.inputSchema).toBeDefined();
    expect(tools.quercleFetch.inputSchema).toBeDefined();
  });
});
