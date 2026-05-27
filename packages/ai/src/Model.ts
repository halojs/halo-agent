import * as Schema from "effect/Schema";

// -----------------------------------------------------------------------------
// #region (Model)

export const Api = Schema.Literal("openai-completions", "openai-responses", "anthropic-messages");
export type Api = typeof Api.Type;

export const ReasoningEffort = Schema.Literal("minimal", "low", "medium", "high", "xhigh");
export type ReasoningEffort = typeof ReasoningEffort.Type;

export const ReasoningEffortMap = Schema.Record({
  key: ReasoningEffort,
  value: Schema.NonEmptyTrimmedString,
});
export type ReasoningEffortMap = typeof ReasoningEffortMap.Type;

export const Cost = Schema.Struct({
  input: Schema.NonNegative,
  output: Schema.NonNegative,
  reasoning: Schema.NonNegative,
  cacheRead: Schema.NonNegative,
  cacheWrite: Schema.NonNegative,
});

export const Model = Schema.Struct({
  id: Schema.NonEmptyTrimmedString,
  name: Schema.NonEmptyTrimmedString,
  api: Api,
  provider: Schema.NonEmptyTrimmedString,
  baseURL: Schema.NonEmptyTrimmedString,
  apiKey: Schema.NonEmptyTrimmedString,
  reasoning: Schema.Boolean,
  reasoningEffortMap: Schema.optional(ReasoningEffortMap),
  input: Schema.Array(Schema.Literal("text", "image")),
  contextWindow: Schema.NonNegative,
  maxTokens: Schema.NonNegative,
  cost: Cost,
  headers: Schema.optional(
    Schema.Record({ key: Schema.NonEmptyTrimmedString, value: Schema.NonEmptyTrimmedString }),
  ),
});
export type Model = typeof Model.Type;

// #endregion

// -----------------------------------------------------------------------------
// #region (Constructors)

export const RawInput = Schema.Struct({
  id: Schema.optional(Schema.NonEmptyTrimmedString),
  name: Schema.optional(Schema.NonEmptyTrimmedString),
  api: Schema.optional(Schema.NonEmptyTrimmedString),
  provider: Schema.optional(Schema.NonEmptyTrimmedString),
  baseURL: Schema.NonEmptyTrimmedString,
  apiKey: Schema.NonEmptyTrimmedString,
  reasoning: Schema.optional(Schema.Boolean),
  reasoningEffortMap: Schema.optional(ReasoningEffortMap),
  input: Schema.optional(Schema.Array(Schema.Literal("text", "image"))),
  contextWindow: Schema.optional(Schema.NonNegative),
  maxTokens: Schema.optional(Schema.NonNegative),
  cost: Schema.optional(Cost),
  headers: Schema.optional(
    Schema.Record({ key: Schema.NonEmptyTrimmedString, value: Schema.NonEmptyTrimmedString }),
  ),
});
export type RawInput = typeof RawInput.Type;

export const decodeUnknown = Schema.decodeUnknownSync(RawInput);

export const make = (input: RawInput): Model => {
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

  const parsed = decodeUnknown(input);

  return Object.assign({}, defaults, parsed);
};

// #endregion
