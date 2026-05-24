/**
 * 统一 LLM 事件流
 *
 * 旨在提供一个统一的接口，供不同的 LLM 事件流实现，以便于在不同的 LLM 交互过程中使用相同的事件处理逻辑。
 */
import * as Schema from "effect/Schema";
import * as Message from "./Prompt";

// -----------------------------------------------------------------------------
// #region (TypeIds)

export const TypeId = "@halo/ai/EventStream";

export type TypeId = typeof TypeId;

// #endregion

// -----------------------------------------------------------------------------
// #region (Type Guards)

export type EventStream =
  | StartEvent
  | TextStartEvent
  | TextDeltaEvent
  | TextEndEvent
  | ReasoningStartEvent
  | ReasoningDeltaEvent
  | ReasoningEndEvent
  | ToolCallStartEvent
  | ToolCallDeltaEvent
  | ToolCallEndEvent
  | DoneEvent
  | ErrorEvent;

// #endregion

// -----------------------------------------------------------------------------
// #region (Base Event)

interface BaseEvent<Type extends string> {
  readonly [TypeId]: TypeId;
  readonly type: Type;
}

interface BaseEventEncoded<Type extends string> {
  readonly type: Type;
}

export const makeEvent = <const Type extends EventStream["type"]>(
  type: Type,
  params: Omit<Extract<EventStream, { type: Type }>, TypeId | "type">,
): Extract<EventStream, { type: Type }> =>
  ({
    ...params,
    [TypeId]: TypeId,
    type,
  }) as any;

export type EventConstructorParams<P extends EventStream> = Omit<P, TypeId | "type">;

// #endregion

// -----------------------------------------------------------------------------
// #region (Start Event)

export interface StartEvent extends BaseEvent<"start"> {
  readonly partial: Message.AssistantMessage;
}

export interface StartEventEncoded extends BaseEventEncoded<"start"> {
  readonly partial: Message.AssistantMessageEncoded;
}

export const StartEvent: Schema.Schema<StartEvent, StartEventEncoded> = Schema.Struct({
  type: Schema.Literal("start"),
  partial: Message.AssistantMessage,
}).pipe(
  Schema.attachPropertySignature(TypeId, TypeId),
  Schema.annotations({ identifier: "StartEvent" }),
);

export const startEvent = (params: EventConstructorParams<StartEvent>): StartEvent =>
  makeEvent("start", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Text Start Event)

export interface TextStartEvent extends BaseEvent<"text-start"> {
  readonly contentIndex: number;
  readonly partial: Message.AssistantMessage;
}

export interface TextStartEventEncoded extends BaseEventEncoded<"text-start"> {
  readonly contentIndex: number;
  readonly partial: Message.AssistantMessageEncoded;
}

export const TextStartEvent: Schema.Schema<TextStartEvent, TextStartEventEncoded> = Schema.Struct({
  type: Schema.Literal("text-start"),
  contentIndex: Schema.Number,
  partial: Message.AssistantMessage,
}).pipe(
  Schema.attachPropertySignature(TypeId, TypeId),
  Schema.annotations({ identifier: "TextStartEvent" }),
);

export const textStartEvent = (params: EventConstructorParams<TextStartEvent>): TextStartEvent =>
  makeEvent("text-start", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Text Delta Event)

export interface TextDeltaEvent extends BaseEvent<"text-delta"> {
  readonly contentIndex: number;
  readonly delta: string;
  readonly partial: Message.AssistantMessage;
}

export interface TextDeltaEventEncoded extends BaseEventEncoded<"text-delta"> {
  readonly contentIndex: number;
  readonly delta: string;
  readonly partial: Message.AssistantMessageEncoded;
}

export const TextDeltaEvent: Schema.Schema<TextDeltaEvent, TextDeltaEventEncoded> = Schema.Struct({
  type: Schema.Literal("text-delta"),
  contentIndex: Schema.Number,
  delta: Schema.String,
  partial: Message.AssistantMessage,
}).pipe(
  Schema.attachPropertySignature(TypeId, TypeId),
  Schema.annotations({ identifier: "TextDeltaEvent" }),
);

export const textDeltaEvent = (params: EventConstructorParams<TextDeltaEvent>): TextDeltaEvent =>
  makeEvent("text-delta", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Text End Event)

export interface TextEndEvent extends BaseEvent<"text-end"> {
  readonly contentIndex: number;
  readonly content: string;
  readonly partial: Message.AssistantMessage;
}

export interface TextEndEventEncoded extends BaseEventEncoded<"text-end"> {
  readonly contentIndex: number;
  readonly content: string;
  readonly partial: Message.AssistantMessageEncoded;
}

export const TextEndEvent: Schema.Schema<TextEndEvent, TextEndEventEncoded> = Schema.Struct({
  type: Schema.Literal("text-end"),
  contentIndex: Schema.Number,
  content: Schema.String,
  partial: Message.AssistantMessage,
}).pipe(
  Schema.attachPropertySignature(TypeId, TypeId),
  Schema.annotations({ identifier: "TextEndEvent" }),
);

export const textEndEvent = (params: EventConstructorParams<TextEndEvent>): TextEndEvent =>
  makeEvent("text-end", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Reasoning Start Event)

export interface ReasoningStartEvent extends BaseEvent<"reasoning-start"> {
  readonly contentIndex: number;
  readonly partial: Message.AssistantMessage;
}

export interface ReasoningStartEventEncoded extends BaseEventEncoded<"reasoning-start"> {
  readonly contentIndex: number;
  readonly partial: Message.AssistantMessageEncoded;
}

export const ReasoningStartEvent: Schema.Schema<ReasoningStartEvent, ReasoningStartEventEncoded> =
  Schema.Struct({
    type: Schema.Literal("reasoning-start"),
    contentIndex: Schema.Number,
    partial: Message.AssistantMessage,
  }).pipe(
    Schema.attachPropertySignature(TypeId, TypeId),
    Schema.annotations({ identifier: "ReasoningStartEvent" }),
  );

export const reasoningStartEvent = (
  params: EventConstructorParams<ReasoningStartEvent>,
): ReasoningStartEvent => makeEvent("reasoning-start", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Reasoning Delta Event)

export interface ReasoningDeltaEvent extends BaseEvent<"reasoning-delta"> {
  readonly contentIndex: number;
  readonly delta: string;
  readonly partial: Message.AssistantMessage;
}

export interface ReasoningDeltaEventEncoded extends BaseEventEncoded<"reasoning-delta"> {
  readonly contentIndex: number;
  readonly delta: string;
  readonly partial: Message.AssistantMessageEncoded;
}

export const ReasoningDeltaEvent: Schema.Schema<ReasoningDeltaEvent, ReasoningDeltaEventEncoded> =
  Schema.Struct({
    type: Schema.Literal("reasoning-delta"),
    contentIndex: Schema.Number,
    delta: Schema.String,
    partial: Message.AssistantMessage,
  }).pipe(
    Schema.attachPropertySignature(TypeId, TypeId),
    Schema.annotations({ identifier: "ReasoningDeltaEvent" }),
  );

export const reasoningDeltaEvent = (
  params: EventConstructorParams<ReasoningDeltaEvent>,
): ReasoningDeltaEvent => makeEvent("reasoning-delta", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Reasoning End Event)

export interface ReasoningEndEvent extends BaseEvent<"reasoning-end"> {
  readonly contentIndex: number;
  readonly content: string;
  readonly partial: Message.AssistantMessage;
}

export interface ReasoningEndEventEncoded extends BaseEventEncoded<"reasoning-end"> {
  readonly contentIndex: number;
  readonly content: string;
  readonly partial: Message.AssistantMessageEncoded;
}

export const ReasoningEndEvent: Schema.Schema<ReasoningEndEvent, ReasoningEndEventEncoded> =
  Schema.Struct({
    type: Schema.Literal("reasoning-end"),
    contentIndex: Schema.Number,
    content: Schema.String,
    partial: Message.AssistantMessage,
  }).pipe(
    Schema.attachPropertySignature(TypeId, TypeId),
    Schema.annotations({ identifier: "ReasoningEndEvent" }),
  );

export const reasoningEndEvent = (
  params: EventConstructorParams<ReasoningEndEvent>,
): ReasoningEndEvent => makeEvent("reasoning-end", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (ToolCall Start Event)

export interface ToolCallStartEvent extends BaseEvent<"toolcall-start"> {
  readonly contentIndex: number;
  readonly partial: Message.AssistantMessage;
}

export interface ToolCallStartEventEncoded extends BaseEventEncoded<"toolcall-start"> {
  readonly contentIndex: number;
  readonly partial: Message.AssistantMessageEncoded;
}

export const ToolCallStartEvent: Schema.Schema<ToolCallStartEvent, ToolCallStartEventEncoded> =
  Schema.Struct({
    type: Schema.Literal("toolcall-start"),
    contentIndex: Schema.Number,
    partial: Message.AssistantMessage,
  }).pipe(
    Schema.attachPropertySignature(TypeId, TypeId),
    Schema.annotations({ identifier: "ToolCallStartEvent" }),
  );

export const toolCallStartEvent = (
  params: EventConstructorParams<ToolCallStartEvent>,
): ToolCallStartEvent => makeEvent("toolcall-start", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (ToolCall Delta Event)

export interface ToolCallDeltaEvent extends BaseEvent<"toolcall-delta"> {
  readonly contentIndex: number;
  readonly delta: string;
  readonly partial: Message.AssistantMessage;
}

export interface ToolCallDeltaEventEncoded extends BaseEventEncoded<"toolcall-delta"> {
  readonly contentIndex: number;
  readonly delta: string;
  readonly partial: Message.AssistantMessageEncoded;
}

export const ToolCallDeltaEvent: Schema.Schema<ToolCallDeltaEvent, ToolCallDeltaEventEncoded> =
  Schema.Struct({
    type: Schema.Literal("toolcall-delta"),
    contentIndex: Schema.Number,
    delta: Schema.String,
    partial: Message.AssistantMessage,
  }).pipe(
    Schema.attachPropertySignature(TypeId, TypeId),
    Schema.annotations({ identifier: "ToolCallDeltaEvent" }),
  );

export const toolCallDeltaEvent = (
  params: EventConstructorParams<ToolCallDeltaEvent>,
): ToolCallDeltaEvent => makeEvent("toolcall-delta", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (ToolCall End Event)

export interface ToolCallEndEvent extends BaseEvent<"toolcall-end"> {
  readonly contentIndex: number;
  readonly toolCall: Message.ToolCall;
  readonly partial: Message.AssistantMessage;
}

export interface ToolCallEndEventEncoded extends BaseEventEncoded<"toolcall-end"> {
  readonly contentIndex: number;
  readonly toolCall: Message.ToolCallEncoded;
  readonly partial: Message.AssistantMessageEncoded;
}

export const ToolCallEndEvent: Schema.Schema<ToolCallEndEvent, ToolCallEndEventEncoded> =
  Schema.Struct({
    type: Schema.Literal("toolcall-end"),
    contentIndex: Schema.Number,
    toolCall: Message.ToolCall,
    partial: Message.AssistantMessage,
  }).pipe(
    Schema.attachPropertySignature(TypeId, TypeId),
    Schema.annotations({ identifier: "ToolCallEndEvent" }),
  );

export const toolCallEndEvent = (
  params: EventConstructorParams<ToolCallEndEvent>,
): ToolCallEndEvent => makeEvent("toolcall-end", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Done Event)

export interface DoneEvent extends BaseEvent<"done"> {
  reason: Extract<Message.StopReason, "stop" | "length" | "toolUse">;
  message: Message.AssistantMessage;
  usage: Message.Usage;
}

export interface DoneEventEncoded extends BaseEventEncoded<"done"> {
  reason: Extract<Message.StopReason, "stop" | "length" | "toolUse">;
  message: Message.AssistantMessageEncoded;
  usage: Message.Usage;
}

export const DoneEvent: Schema.Schema<DoneEvent, DoneEventEncoded> = Schema.Struct({
  type: Schema.Literal("done"),
  reason: Schema.Literal("stop", "length", "toolUse"),
  message: Message.AssistantMessage,
  usage: Message.Usage,
}).pipe(
  Schema.attachPropertySignature(TypeId, TypeId),
  Schema.annotations({ identifier: "DoneEvent" }),
);

export const doneEvent = (params: EventConstructorParams<DoneEvent>): DoneEvent =>
  makeEvent("done", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Error Event)

export interface ErrorEvent extends BaseEvent<"error"> {
  reason: Extract<Message.StopReason, "aborted" | "error">;
  error: Message.AssistantMessage;
}

export interface ErrorEventEncoded extends BaseEventEncoded<"error"> {
  reason: Extract<Message.StopReason, "aborted" | "error">;
  error: Message.AssistantMessageEncoded;
}

export const ErrorEvent: Schema.Schema<ErrorEvent, ErrorEventEncoded> = Schema.Struct({
  type: Schema.Literal("error"),
  reason: Schema.Literal("error", "aborted"),
  error: Message.AssistantMessage,
}).pipe(
  Schema.attachPropertySignature(TypeId, TypeId),
  Schema.annotations({ identifier: "ErrorEvent" }),
);

export const errorEvent = (params: EventConstructorParams<ErrorEvent>): ErrorEvent =>
  makeEvent("error", params);

// #endregion
