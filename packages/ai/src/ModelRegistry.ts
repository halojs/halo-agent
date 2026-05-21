import type { ParseError } from "effect/ParseResult";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import * as Schema from "effect/Schema";
import * as Error from "./Error";
import * as Model from "./Model";

// -----------------------------------------------------------------------------
// #region (Contexts)

export class ModelRegistry extends Context.Tag("@halo/ai/ModelRegistry")<
  ModelRegistry,
  Service
>() {}

export interface Service {
  /**
   * 已注册的模型供应商
   */
  readonly providers: Effect.Effect<string[]>;

  /**
   * 导出 JSON 格式
   */
  readonly exportJson: Effect.Effect<string, Error.InvalidOutputError>;

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

// #endregion

// -----------------------------------------------------------------------------
// #region (Constructors)

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

export type RawInput = Record<string, Record<string, Model.RawInput>>;
export type RegistedModels = Map<string, Map<string, Model.Model>>;

/**
 * 构造模型注册器
 */
export const make = Effect.fnUntraced(function* (input: RawInput) {
  const registed: RegistedModels = new Map();

  for (const [provider, models] of Object.entries(input)) {
    const providerModels = new Map<string, Model.Model>();
    for (const [id, model] of Object.entries(models)) {
      providerModels.set(id, Model.make({ id, provider, ...model }));
    }
    registed.set(provider, providerModels);
  }

  const modelRegistry = yield* Ref.make<RegistedModels>(registed);

  return ModelRegistry.of({
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
        Error.InvalidOutputError.fromParseError({
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

// #endregion

// -----------------------------------------------------------------------------
// #region (Layers)

/**
 * 构造 ModelRegistryLayer
 */
export const layer = (input: RawInput): Layer.Layer<ModelRegistry> =>
  Layer.effect(ModelRegistry, make(input));

/**
 * 从 JSON 构造 ModelRegistryLayer
 */
export const layerFromJson = (data: string): Layer.Layer<ModelRegistry, ParseError> =>
  Layer.effect(ModelRegistry, fromJson(data));

// #endregion

// -----------------------------------------------------------------------------
// #region (Accessors)

export const providers: Effect.Effect<string[], never, ModelRegistry> = Effect.flatMap(
  ModelRegistry,
  (service) => service.providers,
);

export const exportJson: Effect.Effect<string, Error.InvalidOutputError, ModelRegistry> =
  Effect.flatMap(ModelRegistry, (service) => service.exportJson);

export const getModel = (
  provider: string,
  modelId: string,
): Effect.Effect<Model.Model, ProviderNotFoundError | ModelNotFoundError, ModelRegistry> =>
  ModelRegistry.pipe(Effect.flatMap((service) => service.getModel(provider, modelId)));

export const getModels = (
  provider: string,
): Effect.Effect<Model.Model[], ProviderNotFoundError, ModelRegistry> =>
  ModelRegistry.pipe(Effect.flatMap((service) => service.getModels(provider)));

// #endregion

// -----------------------------------------------------------------------------
// #region (Errors)

export class ProviderNotFoundError extends Schema.TaggedError<ProviderNotFoundError>(
  "@halo/ai/model/ProviderNotFoundError",
)("ProviderNotFoundError", { provider: Schema.String }) {}

export class ModelNotFoundError extends Schema.TaggedError<ModelNotFoundError>(
  "@halo/ai/model/ModelNotFoundError",
)("ModelNotFoundError", { provider: Schema.String, modelId: Schema.String }) {}

// #endregion
