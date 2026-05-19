import * as Schema from "effect/Schema";

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
