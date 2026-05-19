import type { ParseError } from "effect/ParseResult";
import { Model } from "@halo-ai/contracts";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import * as Schema from "effect/Schema";
import * as LlmError from "~/errors";

export class Registry extends Context.Tag("@halo/ai/model/ModelRegistry")<Registry, Service>() {}

export interface Service {
  /**
   * 已注册的模型供应商
   */
  readonly providers: Effect.Effect<string[]>;

  /**
   * 导出 JSON 格式
   */
  readonly exportJson: Effect.Effect<string, LlmError.InvalidOutputError>;

  /**
   * 获得已注册的模型设置
   */
  readonly getModel: (
    provider: string,
    modelId: string,
  ) => Effect.Effect<Model.Model, ProviderNotFoundError | ModelNotFoundError>;

  /**
   * 获取指定供应商已注册的所有模型设置
   */
  readonly getModels: (provider: string) => Effect.Effect<Model.Model[], ProviderNotFoundError>;
}

// =============================================================================
// Constructors
// =============================================================================

export const RawInputModel = Schema.Struct({
  id: Schema.optional(Schema.NonEmptyTrimmedString),
  name: Schema.optional(Schema.NonEmptyTrimmedString),
  api: Schema.optional(Schema.NonEmptyTrimmedString),
  provider: Schema.optional(Schema.NonEmptyTrimmedString),
  baseURL: Schema.NonEmptyTrimmedString,
  apiKey: Schema.NonEmptyTrimmedString,
  reasoning: Schema.optional(Schema.Boolean),
  reasoningEffortMap: Schema.optional(Model.ReasoningEffortMap),
  input: Schema.optional(Schema.Array(Schema.Literal("text", "image"))),
  contextWindow: Schema.optional(Schema.NonNegative),
  maxTokens: Schema.optional(Schema.NonNegative),
  cost: Schema.optional(Model.Cost),
  headers: Schema.optional(
    Schema.Record({ key: Schema.NonEmptyTrimmedString, value: Schema.NonEmptyTrimmedString }),
  ),
});
export type RawInputModel = typeof RawInputModel.Type;

const decodeUnknownModel = Schema.decodeUnknownSync(RawInputModel);

export const makeModel = (input: RawInputModel): Model.Model => {
  const defaults = {
    id: "",
    name: "",
    api: "openai-completions" as const,
    provider: "",
    reasoning: false as const,
    input: ["text"] as const,
    contextWindow: 0,
    maxTokens: 0,
    cost: {
      input: 0,
      output: 0,
      reasoning: 0,
      cacheRead: 0,
      cacheWrite: 0,
    },
  };

  const parsed = decodeUnknownModel(input);

  return Object.assign({}, defaults, parsed);
};

const FromJson = Schema.parseJson(
  Schema.Record({
    key: Schema.NonEmptyTrimmedString,
    value: Schema.Record({
      key: Schema.NonEmptyTrimmedString,
      value: Model.Model,
    }),
  }),
);

const encodeJson = Schema.encode(FromJson);
const decodeJson = Schema.decodeUnknown(FromJson);

type RegistedModels = Map<string, Map<string, Model.Model>>;

export type RawInput = Record<string, Record<string, RawInputModel>>;

/**
 * 构造模型注册器
 */
export const make = Effect.fnUntraced(function* (input: RawInput) {
  const registed: RegistedModels = new Map();

  for (const [provider, models] of Object.entries(input)) {
    const providerModels = new Map<string, Model.Model>();
    for (const [id, model] of Object.entries(models)) {
      providerModels.set(id, makeModel({ id, provider, ...model }));
    }
    registed.set(provider, providerModels);
  }

  const modelRegistry = yield* Ref.make<RegistedModels>(registed);

  return Registry.of({
    providers: Ref.get(modelRegistry).pipe(
      Effect.map((registry) => Array.from(registry.keys())),
      Effect.withSpan("ModelRegistry.providers"),
    ),

    exportJson: Ref.get(modelRegistry).pipe(
      Effect.map((registry) => {
        const recordable: Record<string, Record<string, Model.Model>> = {};
        for (const [provider, models] of registry) {
          recordable[provider] = {};
          for (const [id, model] of models) {
            recordable[provider][id] = model;
          }
        }
        return recordable;
      }),
      Effect.flatMap(encodeJson),
      Effect.catchTag("ParseError", (error) =>
        LlmError.InvalidOutputError.fromParseError({
          module: "ModelRegistry",
          method: "exportJson",
          description: "Failed to encode model registry",
          error,
        }),
      ),
      Effect.withSpan("ModelRegistry.providers"),
    ),

    getModel: Effect.fnUntraced(function* (provider, modelId) {
      const registry = yield* Ref.get(modelRegistry);
      const providerModels = registry.get(provider);

      if (providerModels === undefined) {
        return yield* new ProviderNotFoundError({ provider });
      }

      const model = providerModels.get(modelId);
      if (model === undefined) {
        return yield* new ModelNotFoundError({ provider, modelId });
      }

      return model;
    }, Effect.withSpan("ModelRegistry.getModel")),

    getModels: Effect.fnUntraced(function* (provider) {
      const registry = yield* Ref.get(modelRegistry);
      const providerModels = registry.get(provider);

      if (providerModels === undefined) {
        return yield* new ProviderNotFoundError({ provider });
      }

      return Array.from(providerModels.values());
    }, Effect.withSpan("ModelRegistry.getModels")),
  });
});

/**
 * 从 JSON 构造模型注册器
 */
export const fromJson = (data: string): Effect.Effect<Service, ParseError> =>
  Effect.flatMap(decodeJson(data), make);

/**
 * 构造 ModelRegistryLayer
 */
export const layer = (input: RawInput): Layer.Layer<Registry> =>
  Layer.effect(Registry, make(input));

/**
 * 从 JSON 构造 ModelRegistryLayer
 */
export const layerFromJson = (data: string): Layer.Layer<Registry, ParseError> =>
  Layer.effect(Registry, fromJson(data));

// =============================================================================
// Errors
// =============================================================================

export class ProviderNotFoundError extends Schema.TaggedError<ProviderNotFoundError>(
  "@halo/ai/model/ProviderNotFoundError",
)("ProviderNotFoundError", { provider: Schema.String }) {}

export class ModelNotFoundError extends Schema.TaggedError<ModelNotFoundError>(
  "@halo/ai/model/ModelNotFoundError",
)("ModelNotFoundError", { provider: Schema.String, modelId: Schema.String }) {}
