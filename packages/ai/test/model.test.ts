import { it, expect, describe } from "@effect/vitest";
import * as Model from "~/Model";

describe("Model", () => {
  it("should be make a model", () => {
    const model = Model.make({
      id: "deepseek",
      name: "Deepseek V4 Flash",
      provider: "deepseek",
      baseURL: "https://api.deepseek.com",
      apiKey: "DEEPSEEP_API_KEY",
    });

    expect(model).toMatchInlineSnapshot(`
      {
        "api": "openai-completions",
        "apiKey": "DEEPSEEP_API_KEY",
        "baseURL": "https://api.deepseek.com",
        "contextWindow": 0,
        "cost": {
          "cacheRead": 0,
          "cacheWrite": 0,
          "input": 0,
          "output": 0,
          "reasoning": 0,
        },
        "id": "deepseek",
        "input": [
          "text",
        ],
        "maxTokens": 0,
        "name": "Deepseek V4 Flash",
        "provider": "deepseek",
        "reasoning": false,
      }
    `);
  });
});
