import type { ParseError } from "effect/ParseResult";
import * as Schema from "effect/Schema";

// -----------------------------------------------------------------------------
// #region (Invalid Errors)

export class InvalidOutputError extends Schema.TaggedError<InvalidOutputError>(
  "@halo/ai/Error/InvalidOutputError",
)("InvalidOutputError", {
  module: Schema.String,
  method: Schema.String,
  description: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.Defect),
}) {
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
