import type { ParseError } from "effect/ParseResult";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

// -----------------------------------------------------------------------------
// #region (Error)

export const TypeId = "@halo/ai/AiError";

export type TypeId = typeof TypeId;

export const isAiError = (u: unknown): u is AiError => Predicate.hasProperty(u, TypeId);

export type AiError = InvalidOutputError | ProviderNotFoundError | ModelNotFoundError;

// #endregion

// -----------------------------------------------------------------------------
// #region (Invalid Output Error)

export class InvalidOutputError extends Schema.TaggedError<InvalidOutputError>(
  "@halo/ai/AiError/InvalidOutputError",
)("InvalidOutputError", {
  module: Schema.String,
  method: Schema.String,
  description: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.Defect),
}) {
  readonly [TypeId]: TypeId = TypeId;

  static fromParseError({
    error,
    ...params
  }: {
    readonly module: string;
    readonly method: string;
    readonly description?: string;
    readonly error: ParseError;
  }): InvalidOutputError {
    return new InvalidOutputError({
      ...params,
      cause: error,
    });
  }
}

// #endregion

// -----------------------------------------------------------------------------
// #region (Provider Not Found Error)

export class ProviderNotFoundError extends Schema.TaggedError<ProviderNotFoundError>(
  "@halo/ai/AiError/ProviderNotFoundError",
)("ProviderNotFoundError", { provider: Schema.String }) {
  readonly [TypeId]: TypeId = TypeId;

  override get message(): string {
    return `Provider not found: ${this.provider}`;
  }
}

// #endregion

// -----------------------------------------------------------------------------
// #region (Model Not Found Error)

export class ModelNotFoundError extends Schema.TaggedError<ModelNotFoundError>(
  "@halo/ai/AiError/ModelNotFoundError",
)("ModelNotFoundError", { provider: Schema.String, modelId: Schema.String }) {
  readonly [TypeId]: TypeId = TypeId;

  override get message(): string {
    return `Model not found: ${this.provider}/${this.modelId}`;
  }
}

// #endregion

// -----------------------------------------------------------------------------
// #region (Unknown Error)

export class UnknownError extends Schema.TaggedError<UnknownError>("@halo/ai/AiError/UnknownError")(
  "UnknownError",
  {
    module: Schema.String,
    method: Schema.String,
    description: Schema.optional(Schema.String),
    cause: Schema.optional(Schema.Defect),
  },
) {
  readonly [TypeId]: TypeId = TypeId;

  override get message(): string {
    const moduleMethod = `${this.module}.${this.method}`;
    return Predicate.isUndefined(this.description)
      ? `${moduleMethod}: An error occurred`
      : `${moduleMethod}: ${this.description}`;
  }
}

// #endregion
