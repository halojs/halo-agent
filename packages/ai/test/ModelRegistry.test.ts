import { it, expect, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as ModelRegistry from "~/ModelRegistry";

describe("Model", () => {
  it.scoped("should be get providers", () =>
    Effect.gen(function* () {
      const registry = yield* ModelRegistry.make({
        deepseek: {
          "deepseek-v4-flash": {
            name: "Deepseek V4 Flash",
            baseURL: "https://api.deepseek.com",
            apiKey: "DEEPSEEP_API_KEY",
          },
        },
      });

      expect(yield* registry.providers).toEqual(["deepseek"]);
    }),
  );

  it.scoped("should be get model", () =>
    Effect.gen(function* () {
      const registry = yield* ModelRegistry.make({
        deepseek: {
          "deepseek-v4-flash": {
            name: "Deepseek V4 Flash",
            baseURL: "https://api.deepseek.com",
            apiKey: "DEEPSEEP_API_KEY",
          },
        },
      });

      expect(yield* registry.getModel("deepseek", "deepseek-v4-flash")).toHaveProperty(
        "api",
        "openai-completions",
      );
    }),
  );

  it.scoped("should be get models", () =>
    Effect.gen(function* () {
      const registry = yield* ModelRegistry.make({
        deepseek: {
          "deepseek-v4-flash": {
            name: "Deepseek V4 Flash",
            baseURL: "https://api.deepseek.com",
            apiKey: "DEEPSEEP_API_KEY",
          },
          "deepseek-v4-pro": {
            name: "Deepseek V4 Pro",
            baseURL: "https://api.deepseek.com",
            apiKey: "DEEPSEEP_API_KEY",
          },
        },
      });

      expect(yield* registry.getModels("deepseek")).toHaveLength(2);
    }),
  );

  it.scoped("should throw error when provider not found", () =>
    Effect.gen(function* () {
      const registry = yield* ModelRegistry.make({
        deepseek: {
          "deepseek-v4-flash": {
            name: "Deepseek V4 Flash",
            baseURL: "https://api.deepseek.com",
            apiKey: "DEEPSEEP_API_KEY",
          },
        },
      });

      const exit = yield* Effect.exit(registry.getModels("bad"));

      expect(Exit.isFailure(exit)).toBe(true);
    }),
  );

  it.scoped("should throw error when model not found", () =>
    Effect.gen(function* () {
      const registry = yield* ModelRegistry.make({
        deepseek: {
          "deepseek-v4-flash": {
            name: "Deepseek V4 Flash",
            baseURL: "https://api.deepseek.com",
            apiKey: "DEEPSEEP_API_KEY",
          },
        },
      });

      const exit = yield* Effect.exit(registry.getModel("deepseek", "bad"));

      expect(Exit.isFailure(exit)).toBe(true);
    }),
  );

  it.scoped("should export registed models to json data", () =>
    Effect.gen(function* () {
      const registry = yield* ModelRegistry.make({
        deepseek: {
          "deepseek-v4-flash": {
            name: "Deepseek V4 Flash",
            baseURL: "https://api.deepseek.com",
            apiKey: "DEEPSEEP_API_KEY",
          },
        },
      });

      expect(yield* registry.exportJson).toMatchInlineSnapshot(
        `"{"deepseek":{"deepseek-v4-flash":{"id":"deepseek-v4-flash","name":"Deepseek V4 Flash","api":"openai-completions","provider":"deepseek","baseURL":"https://api.deepseek.com","apiKey":"DEEPSEEP_API_KEY","reasoning":false,"input":["text"],"contextWindow":0,"maxTokens":0,"cost":{"input":0,"output":0,"reasoning":0,"cacheRead":0,"cacheWrite":0}}}}"`,
      );
    }),
  );

  it.scoped("should make registry from json data", () =>
    Effect.gen(function* () {
      const data =
        '{"deepseek":{"deepseek-v4-flash":{"id":"deepseek-v4-flash","name":"Deepseek V4 Flash","api":"openai-completions","provider":"deepseek","baseURL":"https://api.deepseek.com","apiKey":"DEEPSEEP_API_KEY","reasoning":false,"input":["text"],"contextWindow":0,"maxTokens":0,"cost":{"input":0,"output":0,"reasoning":0,"cacheRead":0,"cacheWrite":0}}}}';

      const registry = yield* ModelRegistry.fromJson(data);

      expect(yield* registry.getModel("deepseek", "deepseek-v4-flash")).toHaveProperty(
        "api",
        "openai-completions",
      );
    }),
  );

  it.scoped("should throw ParseError when make registry from json", () =>
    Effect.gen(function* () {
      const data =
        '{"deepseek":{"deepseek-v4-flash":{"id":"deepseek-v4-flash","name":"Deepseek V4 Flash"}}}';

      const exit = yield* Effect.exit(ModelRegistry.fromJson(data));

      expect(Exit.isFailure(exit)).toBe(true);
    }),
  );

  it.scoped("should use registry with layer", () =>
    Effect.gen(function* () {
      const ModelRegistryLive = ModelRegistry.layer({
        deepseek: {
          "deepseek-v4-flash": {
            name: "Deepseek V4 Flash",
            baseURL: "https://api.deepseek.com",
            apiKey: "DEEPSEEP_API_KEY",
          },
        },
      });

      const result = yield* ModelRegistry.providers.pipe(Effect.provide(ModelRegistryLive));

      expect(result).toEqual(["deepseek"]);
    }),
  );
});
