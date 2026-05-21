import * as Arr from "effect/Array";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import * as Model from "./Model";

const constEmptyObject = () => ({});

// -----------------------------------------------------------------------------
// #region (TypeIds)

export const MessageTypeId = "@halo/ai/Message";
export type MessageTypeId = typeof MessageTypeId;

export const ContentTypeId = "@halo/ai/Message/Content";
export type ContentTypeId = typeof ContentTypeId;

// #endregion

// -----------------------------------------------------------------------------
// #region (Options)

const ProviderOptions = Schema.Record({
  key: Schema.String,
  value: Schema.UndefinedOr(
    Schema.Record({
      key: Schema.String,
      value: Schema.Unknown,
    }),
  ),
});

type ProviderOptions = typeof ProviderOptions.Type;

// #endregion

// -----------------------------------------------------------------------------
// #region (Type Guards)

export type Message = SystemMessage | UserMessage | AssistantMessage | ToolResultMessage;

export const isMessage = (u: unknown): u is Message => Predicate.hasProperty(u, MessageTypeId);

export type Content = TextContent | ReasoningContent | FileContent | ToolCall;

export const isContent = (u: unknown): u is Content => Predicate.hasProperty(u, ContentTypeId);

// #endregion

// -----------------------------------------------------------------------------
// #region (Base Content)

interface BaseContent<Type extends string, Options extends ProviderOptions> {
  /**
   * 内容类型标识符
   */
  readonly [ContentTypeId]: ContentTypeId;
  /**
   * 消息内容类型
   */
  readonly type: Type;
  /**
   * 提供商独有的选项
   */
  readonly options: Options;
}

interface BaseContentEncoded<Type extends string, Options extends ProviderOptions> {
  readonly type: Type;
  readonly options?: Options | undefined;
}

export const makeContent = <const Type extends Content["type"]>(
  type: Type,
  params: Omit<Extract<Content, { type: Type }>, ContentTypeId | "type" | "options"> & {
    readonly options?: Content["options"] | undefined;
  },
): Extract<Content, { type: Type }> =>
  ({
    ...params,
    [ContentTypeId]: ContentTypeId,
    type,
    options: params.options ?? {},
  }) as any;

export type ContentConstructorParams<P extends Content> = Omit<
  P,
  ContentTypeId | "type" | "options"
> & {
  readonly options?: Content["options"] | undefined;
};

// #endregion

// -----------------------------------------------------------------------------
// #region (Text Content)

export interface TextContent extends BaseContent<"text", TextContentOptions> {
  readonly text: string;
}

export interface TextContentEncoded extends BaseContentEncoded<"text", TextContentOptions> {
  readonly text: string;
}

export interface TextContentOptions extends ProviderOptions {}

export const TextContent: Schema.Schema<TextContent, TextContentEncoded> = Schema.Struct({
  type: Schema.Literal("text"),
  text: Schema.String,
  options: Schema.optionalWith(ProviderOptions, { default: constEmptyObject }),
}).pipe(
  Schema.attachPropertySignature(ContentTypeId, ContentTypeId),
  Schema.annotations({ identifier: "TextContent" }),
);

export const textContent = (params: ContentConstructorParams<TextContent>): TextContent =>
  makeContent("text", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Reasoning Content)

export interface ReasoningContent extends BaseContent<"reasoning", ReasoningContentOptions> {
  readonly reasoning: string;
}

export interface ReasoningContentEncoded extends BaseContentEncoded<
  "reasoning",
  ReasoningContentOptions
> {
  readonly reasoning: string;
}

export interface ReasoningContentOptions extends ProviderOptions {}

export const ReasoningContent: Schema.Schema<ReasoningContent, ReasoningContentEncoded> =
  Schema.Struct({
    type: Schema.Literal("reasoning"),
    reasoning: Schema.String,
    options: Schema.optionalWith(ProviderOptions, { default: constEmptyObject }),
  }).pipe(
    Schema.attachPropertySignature(ContentTypeId, ContentTypeId),
    Schema.annotations({ identifier: "ReasoningContent" }),
  );

export const reasoningContent = (
  params: ContentConstructorParams<ReasoningContent>,
): ReasoningContent => makeContent("reasoning", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (File Content)

export interface FileContent extends BaseContent<"file", FileContentOptions> {
  readonly mediaType: string;
  readonly fileName?: string;
  readonly data: string | Uint8Array | URL;
}

export interface FileContentEncoded extends BaseContentEncoded<"file", FileContentOptions> {
  readonly mediaType: string;
  readonly fileName?: string;
  readonly data: string | Uint8Array | URL;
}

export interface FileContentOptions extends ProviderOptions {}

export const FileContent: Schema.Schema<FileContent, FileContentEncoded> = Schema.Struct({
  type: Schema.Literal("file"),
  mediaType: Schema.String,
  fileName: Schema.optional(Schema.String),
  data: Schema.Union(Schema.String, Schema.Uint8ArrayFromSelf, Schema.URLFromSelf),
  options: Schema.optionalWith(ProviderOptions, { default: constEmptyObject }),
}).pipe(
  Schema.attachPropertySignature(ContentTypeId, ContentTypeId),
  Schema.annotations({ identifier: "FileContent" }),
);

export const fileContent = (params: ContentConstructorParams<FileContent>): FileContent =>
  makeContent("file", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (ToolCall)

export interface ToolCall extends BaseContent<"toolCall", ToolCallOptions> {
  readonly id: string;
  readonly name: string;
  readonly arguments: Record<string, any>;
}

export interface ToolCallEncoded extends BaseContentEncoded<"toolCall", ToolCallOptions> {
  readonly id: string;
  readonly name: string;
  readonly arguments: Record<string, any>;
}

export interface ToolCallOptions extends ProviderOptions {}

export const ToolCall: Schema.Schema<ToolCall, ToolCallEncoded> = Schema.Struct({
  type: Schema.Literal("toolCall"),
  id: Schema.String,
  name: Schema.String,
  arguments: Schema.Record({ key: Schema.String, value: Schema.Any }),
  options: Schema.optionalWith(ProviderOptions, { default: constEmptyObject }),
}).pipe(
  Schema.attachPropertySignature(ContentTypeId, ContentTypeId),
  Schema.annotations({ identifier: "ToolCall" }),
);

export const toolCall = (params: ContentConstructorParams<ToolCall>): ToolCall =>
  makeContent("toolCall", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Base Message)

export interface BaseMessage<Role extends string, Options extends ProviderOptions> {
  readonly [MessageTypeId]: MessageTypeId;
  readonly role: Role;
  readonly options: Options;
  readonly timestamp: number;
}

export interface BaseMessageEncoded<Role extends string, Options extends ProviderOptions> {
  readonly role: Role;
  readonly options?: Options | undefined;
  readonly timestamp: number;
}

export const makeMessage = <const Role extends Message["role"]>(
  role: Role,
  params: Omit<
    Extract<Message, { role: Role }>,
    MessageTypeId | "role" | "options" | "timestamp"
  > & {
    readonly options?: Extract<Message, { role: Role }>["options"];
  },
): Extract<Message, { role: Role }> =>
  ({
    ...params,
    [MessageTypeId]: MessageTypeId,
    role,
    options: params.options ?? {},
    timestamp: Date.now(),
  }) as any;

export type MessageConstructorParams<M extends Message> = Omit<
  M,
  MessageTypeId | "role" | "options" | "timestamp"
> & {
  /**
   * Optional provider-specific options for this message.
   */
  readonly options?: Message["options"] | undefined;
};

export const MessageContentFromString: Schema.Schema<
  Arr.NonEmptyReadonlyArray<TextContent>,
  string
> = Schema.transform(Schema.String, Schema.NonEmptyArray(Schema.typeSchema(TextContent)), {
  strict: true,
  decode: (text) => Arr.of(makeContent("text", { text })),
  encode: (content) => content[0].text,
});

// #endregion

// -----------------------------------------------------------------------------
// #region (System Message)

export interface SystemMessage extends BaseMessage<"system", SystemMessageOptions> {
  readonly content: string;
}

export interface SystemMessageEncoded extends BaseMessageEncoded<"system", SystemMessageOptions> {
  readonly content: string;
}

export interface SystemMessageOptions extends ProviderOptions {}

export const SystemMessage: Schema.Schema<SystemMessage, SystemMessageEncoded> = Schema.Struct({
  role: Schema.Literal("system"),
  content: Schema.String,
  options: Schema.optionalWith(ProviderOptions, { default: constEmptyObject }),
  timestamp: Schema.Number,
}).pipe(
  Schema.attachPropertySignature(MessageTypeId, MessageTypeId),
  Schema.annotations({ identifier: "SystemMessage" }),
);

export const systemMessage = (params: MessageConstructorParams<SystemMessage>): SystemMessage =>
  makeMessage("system", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (User Message)

export interface UserMessage extends BaseMessage<"user", UserMessageOptions> {
  readonly content: ReadonlyArray<UserMessageContent>;
}

export type UserMessageContent = TextContent | FileContent;

export interface UserMessageEncoded extends BaseMessageEncoded<"user", UserMessageOptions> {
  readonly content: string | ReadonlyArray<UserMessageContentEncoded>;
}

export type UserMessageContentEncoded = TextContentEncoded | FileContentEncoded;

export interface UserMessageOptions extends ProviderOptions {}

export const UserMessage: Schema.Schema<UserMessage, UserMessageEncoded> = Schema.Struct({
  role: Schema.Literal("user"),
  content: Schema.Union(
    MessageContentFromString,
    Schema.Array(Schema.Union(TextContent, FileContent)),
  ),
  options: Schema.optionalWith(ProviderOptions, { default: constEmptyObject }),
  timestamp: Schema.Number,
}).pipe(
  Schema.attachPropertySignature(MessageTypeId, MessageTypeId),
  Schema.annotations({ identifier: "UserMessage" }),
);

export const userMessage = (params: MessageConstructorParams<UserMessage>): UserMessage =>
  makeMessage("user", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Assistant Message)

export interface AssistantMessage extends BaseMessage<"assistant", AssistantMessageOptions> {
  readonly api: Model.Api;
  readonly provider: Model.Model["provider"];
  readonly model: Model.Model["id"];
  readonly content: ReadonlyArray<AssistantMessageContent>;
  readonly stopReason: StopReason;
  readonly responseModel?: string;
  readonly responseId?: string;
}

export type AssistantMessageContent = TextContent | ReasoningContent | FileContent | ToolCall;

export interface AssistantMessageEncoded extends BaseMessageEncoded<
  "assistant",
  AssistantMessageOptions
> {
  readonly api: Model.Api;
  readonly provider: Model.Model["provider"];
  readonly model: Model.Model["id"];
  readonly content: ReadonlyArray<AssistantMessageContentEncoded>;
  readonly stopReason: StopReason;
  readonly responseModel?: string;
  readonly responseId?: string;
}

export type AssistantMessageContentEncoded =
  | TextContentEncoded
  | ReasoningContentEncoded
  | FileContentEncoded
  | ToolCallEncoded;

export interface AssistantMessageOptions extends ProviderOptions {}

export const StopReason = Schema.Literal("stop", "length", "toolUse", "error", "aborted");
export type StopReason = typeof StopReason.Type;

export const AssistantMessage: Schema.Schema<AssistantMessage, AssistantMessageEncoded> =
  Schema.Struct({
    role: Schema.Literal("assistant"),
    api: Model.Api,
    provider: Schema.String,
    model: Schema.String,
    content: Schema.Array(Schema.Union(TextContent, ReasoningContent, FileContent, ToolCall)),
    stopReason: StopReason,
    responseModel: Schema.optional(Schema.String),
    responseId: Schema.optional(Schema.String),
    options: Schema.optionalWith(ProviderOptions, { default: constEmptyObject }),
    timestamp: Schema.Number,
  }).pipe(
    Schema.attachPropertySignature(MessageTypeId, MessageTypeId),
    Schema.annotations({ identifier: "AssistantMessage" }),
  );

export const assistantMessage = (
  params: MessageConstructorParams<AssistantMessage>,
): AssistantMessage => makeMessage("assistant", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Tool Result Message)

export interface ToolResultMessage extends BaseMessage<"toolResult", ToolResultMessageOptions> {
  readonly id: string;
  readonly name: string;
  readonly content: ReadonlyArray<ToolResultContent>;
}

export type ToolResultContent = TextContent | FileContent;

export interface ToolResultMessageEncoded extends BaseMessageEncoded<
  "toolResult",
  ToolResultMessageOptions
> {
  readonly id: string;
  readonly name: string;
  readonly content: ReadonlyArray<ToolResultContentEncoded>;
}

export type ToolResultContentEncoded = TextContentEncoded | FileContentEncoded;

export interface ToolResultMessageOptions extends ProviderOptions {}

export const ToolResultMessage: Schema.Schema<ToolResultMessage, ToolResultMessageEncoded> =
  Schema.Struct({
    role: Schema.Literal("toolResult"),
    id: Schema.String,
    name: Schema.String,
    content: Schema.Array(Schema.Union(TextContent, FileContent)),
    options: Schema.optionalWith(ProviderOptions, { default: constEmptyObject }),
    timestamp: Schema.Number,
  }).pipe(
    Schema.attachPropertySignature(MessageTypeId, MessageTypeId),
    Schema.annotations({ identifier: "ToolResultMessage" }),
  );

export const toolResultMessage = (
  params: MessageConstructorParams<ToolResultMessage>,
): ToolResultMessage => makeMessage("toolResult", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Message)

export type MessageEncoded =
  | SystemMessageEncoded
  | UserMessageEncoded
  | AssistantMessageEncoded
  | ToolResultMessageEncoded;

export const Message: Schema.Schema<Message, MessageEncoded> = Schema.Union(
  SystemMessage,
  UserMessage,
  AssistantMessage,
  ToolResultMessage,
);

// #endregion
