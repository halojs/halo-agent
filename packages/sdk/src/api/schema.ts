import { Schema } from "effect";

export const ApiKind = Schema.Literal("openai-completions", "anthropic-messages");
export type ApiKind = typeof ApiKind.Type;

export const TextContent = Schema.Struct({
  type: Schema.Literal("text"),
  text: Schema.String,
  // e.g., for OpenAI responses, message metadata (legacy id string or TextSignatureV1 JSON)
  textSignature: Schema.optional(Schema.String),
});
export type TextContent = typeof TextContent.Type;

export const ThinkingContent = Schema.Struct({
  type: Schema.Literal("thinking"),
  thinking: Schema.String,
  // e.g., for OpenAI responses, the reasoning item ID
  thinkingSignature: Schema.optional(Schema.String),
  // When true, the thinking content was redacted by safety filters. The opaque
  //  encrypted payload is stored in `thinkingSignature` so it can be passed back
  //  to the API for multi-turn continuity.
  redacted: Schema.optional(Schema.Boolean),
});
export type ThinkingContent = typeof ThinkingContent.Type;

export const ToolCall = Schema.Struct({
  type: Schema.Literal("toolCall"),
  id: Schema.String,
  name: Schema.String,
  arguments: Schema.Record({ key: Schema.String, value: Schema.Any }),
  // Google-specific: opaque signature for reusing thought context
  thoughtSignature: Schema.optional(Schema.String),
});
export type ToolCall = typeof ToolCall.Type;

export const Usage = Schema.Struct({
  input: Schema.NonNegative,
  output: Schema.NonNegative,
  cacheRead: Schema.NonNegative,
  cacheWrite: Schema.NonNegative,
  totalTokens: Schema.NonNegative,
  cost: Schema.Struct({
    input: Schema.NonNegative,
    output: Schema.NonNegative,
    cacheRead: Schema.NonNegative,
    cacheWrite: Schema.NonNegative,
    total: Schema.NonNegative,
  }),
});
export type Usage = typeof Usage.Type;

export const StopReasonKind = Schema.Literal("stop", "length", "toolUse", "error", "aborted");
export type StopReasonKind = typeof StopReasonKind.Type;

export const AssistantMessage = Schema.Struct({
  role: Schema.Literal("assistant"),
  content: Schema.Array(Schema.Union(TextContent, ThinkingContent, ToolCall)),
  api: ApiKind,
  provider: Schema.String,
  model: Schema.String,
  // Provider-specific response/message identifier when the upstream API exposes one
  responseId: Schema.optional(Schema.String),
  usage: Usage,
  stopReason: StopReasonKind,
  errorMessage: Schema.optional(Schema.String),
  // Unix timestamp in milliseconds
  timestamp: Schema.Number,
});
export type AssistantMessage = typeof AssistantMessage.Type;

/**
 * Event protocol for AssistantMessageEventStream.
 *
 * Streams should emit `start` before partial updates, then terminate with either:
 * - `done` carrying the final successful AssistantMessage, or
 * - `error` carrying the final AssistantMessage with stopReason "error" or "aborted"
 *   and errorMessage.
 */
export type AssistantMessageEvent =
  | { type: "start"; partial: AssistantMessage }
  | { type: "text_start"; contentIndex: number; partial: AssistantMessage }
  | { type: "text_delta"; contentIndex: number; delta: string; partial: AssistantMessage }
  | { type: "text_end"; contentIndex: number; content: string; partial: AssistantMessage }
  | { type: "thinking_start"; contentIndex: number; partial: AssistantMessage }
  | { type: "thinking_delta"; contentIndex: number; delta: string; partial: AssistantMessage }
  | { type: "thinking_end"; contentIndex: number; content: string; partial: AssistantMessage }
  | { type: "toolcall_start"; contentIndex: number; partial: AssistantMessage }
  | { type: "toolcall_delta"; contentIndex: number; delta: string; partial: AssistantMessage }
  | { type: "toolcall_end"; contentIndex: number; toolCall: ToolCall; partial: AssistantMessage }
  | {
      type: "done";
      reason: Extract<StopReasonKind, "stop" | "length" | "toolUse">;
      message: AssistantMessage;
    }
  | {
      type: "error";
      reason: Extract<StopReasonKind, "aborted" | "error">;
      error: AssistantMessage;
    };
