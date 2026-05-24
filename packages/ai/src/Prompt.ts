import type * as AST from "effect/SchemaAST";
import * as Arbitrary from "effect/Arbitrary";
import * as Arr from "effect/Array";
import { dual } from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import { type Pipeable, pipeArguments } from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import * as Model from "./Model";

const constEmptyObject = () => ({});

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
// #region (Content)

export const ContentTypeId = "@halo/ai/Prompt/Message/Content";

export type ContentTypeId = typeof ContentTypeId;

export type Content = TextContent | ReasoningContent | FileContent | ToolCall;

export const isContent = (u: unknown): u is Content => Predicate.hasProperty(u, ContentTypeId);

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

/**
 * 构造消息内容
 *
 * @category Constructors
 */
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

/**
 * 构造文本内容
 *
 * @category Constructors
 */
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

/**
 * 构造推理内容
 *
 * @category Constructors
 */
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

/**
 * 构造文件内容
 *
 * @category Constructors
 */
export const fileContent = (params: ContentConstructorParams<FileContent>): FileContent =>
  makeContent("file", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (ToolCall)

export interface ToolCall extends BaseContent<"tool-call", ToolCallOptions> {
  readonly id: string;
  readonly name: string;
  readonly arguments: Record<string, any>;
}

export interface ToolCallEncoded extends BaseContentEncoded<"tool-call", ToolCallOptions> {
  readonly id: string;
  readonly name: string;
  readonly arguments: Record<string, any>;
}

export interface ToolCallOptions extends ProviderOptions {}

export const ToolCall: Schema.Schema<ToolCall, ToolCallEncoded> = Schema.Struct({
  type: Schema.Literal("tool-call"),
  id: Schema.String,
  name: Schema.String,
  arguments: Schema.Record({ key: Schema.String, value: Schema.Any }),
  options: Schema.optionalWith(ProviderOptions, { default: constEmptyObject }),
}).pipe(
  Schema.attachPropertySignature(ContentTypeId, ContentTypeId),
  Schema.annotations({ identifier: "ToolCall" }),
);

/**
 * 构造工具调用内容
 *
 * @category Constructors
 */
export const toolCall = (params: ContentConstructorParams<ToolCall>): ToolCall =>
  makeContent("tool-call", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Message)

export const MessageTypeId = "@halo/ai/Prompt/Message";

export type MessageTypeId = typeof MessageTypeId;

export type Message = SystemMessage | UserMessage | AssistantMessage | ToolResultMessage;

export type MessageEncoded =
  | SystemMessageEncoded
  | UserMessageEncoded
  | AssistantMessageEncoded
  | ToolResultMessageEncoded;

export const isMessage = (u: unknown): u is Message => Predicate.hasProperty(u, MessageTypeId);

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

/**
 * 构造消息
 *
 * @category Constructors
 */
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

/**
 * 构造系统消息
 *
 * @category Constructors
 */
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

/**
 * 构造用户消息
 *
 * @category Constructors
 */
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

/**
 * 构造助手消息
 *
 * @category Constructors
 */
export const assistantMessage = (
  params: MessageConstructorParams<AssistantMessage>,
): AssistantMessage => makeMessage("assistant", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Tool Result Message)

export interface ToolResultMessage extends BaseMessage<"tool-result", ToolResultMessageOptions> {
  readonly id: string;
  readonly name: string;
  readonly content: ReadonlyArray<ToolResultContent>;
}

export type ToolResultContent = TextContent | FileContent;

export interface ToolResultMessageEncoded extends BaseMessageEncoded<
  "tool-result",
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
    role: Schema.Literal("tool-result"),
    id: Schema.String,
    name: Schema.String,
    content: Schema.Array(Schema.Union(TextContent, FileContent)),
    options: Schema.optionalWith(ProviderOptions, { default: constEmptyObject }),
    timestamp: Schema.Number,
  }).pipe(
    Schema.attachPropertySignature(MessageTypeId, MessageTypeId),
    Schema.annotations({ identifier: "ToolResultMessage" }),
  );

/**
 * 构造工具结果消息
 *
 * @category Constructors
 */
export const toolResultMessage = (
  params: MessageConstructorParams<ToolResultMessage>,
): ToolResultMessage => makeMessage("tool-result", params);

// #endregion

// -----------------------------------------------------------------------------
// #region (Message Schema)

export const Message: Schema.Schema<Message, MessageEncoded> = Schema.Union(
  SystemMessage,
  UserMessage,
  AssistantMessage,
  ToolResultMessage,
);

// #endregion

// -----------------------------------------------------------------------------
// #region (Usage)

export class Usage extends Schema.Class<Usage>("@halo/ai/Message/Usage")({
  input: Schema.NonNegative,
  output: Schema.NonNegative,
  reasoning: Schema.optional(Schema.NonNegative),
  cacheRead: Schema.optional(Schema.NonNegative),
  cacheWrite: Schema.optional(Schema.NonNegative),
}) {}

// #endregion

// -----------------------------------------------------------------------------
// #region (Prompt)

export const TypeId = "@halo/ai/Prompt";

export type TypeId = typeof TypeId;

export const isPrompt = (u: unknown): u is Prompt => Predicate.hasProperty(u, TypeId);

export interface Prompt extends Pipeable {
  readonly [TypeId]: TypeId;
  readonly messages: ReadonlyArray<Message>;
}

export interface PromptEncoded {
  readonly messages: ReadonlyArray<MessageEncoded>;
}

export class PromptFromSelf extends Schema.declare((u) => isPrompt(u), {
  typeConstructor: { _tag: "effect/ai/Prompt" },
  identifier: "PromptFromSelf",
  description: "a Prompt instance",
  arbitrary: (): Arbitrary.LazyArbitrary<Prompt> => (fc) =>
    fc.array(Arbitrary.makeLazy(Message)(fc)).map(makePrompt),
}) {}

export const Prompt: Schema.Schema<Prompt, PromptEncoded> = Schema.transformOrFail(
  Schema.Struct({ messages: Schema.Array(Schema.encodedSchema(Message)) }),
  PromptFromSelf,
  {
    strict: true,
    decode: (i, _, ast) => decodePrompt(i, ast),
    encode: (a, _, ast) => encodePrompt(a, ast),
  },
).annotations({ identifier: "Prompt" });

const decodeMessages = ParseResult.decodeEither(Schema.Array(Message));
const encodeMessages = ParseResult.encodeEither(Schema.Array(Message));

const decodePrompt = (input: PromptEncoded, ast: AST.AST) =>
  ParseResult.mapBoth(decodeMessages(input.messages), {
    onFailure: () =>
      new ParseResult.Type(ast, input, `Unable to decode ${JSON.stringify(input)} into a Prompt`),
    onSuccess: makePrompt,
  });

const encodePrompt = (input: Prompt, ast: AST.AST) =>
  ParseResult.mapBoth(encodeMessages(input.messages), {
    onFailure: () => new ParseResult.Type(ast, input, `Failed to encode Prompt`),
    onSuccess: (messages) => ({ messages }),
  });

export const FromJson = Schema.parseJson(Prompt);

export type RawInput = string | Prompt | Iterable<MessageEncoded>;

const Proto = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments);
  },
};

const makePrompt = (messages: ReadonlyArray<Message>): Prompt =>
  Object.assign(Object.create(Proto), {
    messages,
  });

const decodeMessagesSync = Schema.decodeSync(Schema.Array(Message));

/**
 * 构造一个空的 Prompt 实例
 *
 * @category Constructors
 */
export const empty: Prompt = makePrompt([]);

/**
 * 构造 Prompt 实例的工厂函数，接受多种输入格式
 *
 * @category Constructors
 */
export const make = (input: RawInput): Prompt => {
  if (Predicate.isString(input)) {
    const content = makeContent("text", { text: input });
    const message = makeMessage("user", { content: [content] });
    return makePrompt([message]);
  }

  if (Predicate.isIterable(input)) {
    return makePrompt(
      decodeMessagesSync(Arr.fromIterable(input), {
        errors: "all",
      }),
    );
  }

  return input;
};

/**
 * 从消息数组构造 Prompt 实例
 *
 * @category Constructors
 */
export const fromMessages = (messages: ReadonlyArray<Message>): Prompt => makePrompt(messages);

// #endregion

// -----------------------------------------------------------------------------
// #region (Utilities)

/**
 * 合并 Prompt
 *
 * 创建一个 Prompt，包含原始 Prompt 和后输入的所有消息，保持消息顺序。
 *
 * @example
 * ```ts
 * const merged = Prompt.merge(systemPrompt, "Hello, world!")
 * ```
 *
 * @category Utilities
 */
export const merge: {
  (input: RawInput): (self: Prompt) => Prompt;
  (self: Prompt, input: RawInput): Prompt;
} = dual(2, (self: Prompt, input: RawInput): Prompt => {
  const other = make(input);
  if (self.messages.length === 0) {
    return other;
  }
  if (other.messages.length === 0) {
    return self;
  }
  return fromMessages([...self.messages, ...other.messages]);
});

/**
 * 替换 System Prompt
 *
 * @category Utilities
 */
export const setSystem: {
  (content: string): (self: Prompt) => Prompt;
  (self: Prompt, content: string): Prompt;
} = dual(2, (self: Prompt, content: string): Prompt => {
  const messages: Array<Message> = [makeMessage("system", { content })];
  for (const message of self.messages) {
    if (message.role !== "system") {
      messages.push(message);
    }
  }
  return makePrompt(messages);
});

/**
 * 向现有 System Prompt 前注入内容
 *
 * 如果存在 System Prompt，则将内容添加到现有 System Prompt 的开头；如果不存在，则创建一个新的 System Prompt。
 *
 * @category Utilities
 */
export const prependSystem: {
  (content: string): (self: Prompt) => Prompt;
  (self: Prompt, content: string): Prompt;
} = dual(2, (self: Prompt, content: string): Prompt => {
  let system: SystemMessage | undefined = undefined;
  for (const message of self.messages) {
    if (message.role === "system") {
      system = makeMessage("system", {
        content: content + message.content,
      });
      break;
    }
  }
  if (Predicate.isUndefined(system)) {
    system = makeMessage("system", { content });
  }
  return makePrompt([system, ...self.messages]);
});

/**
 * 向现有 System Prompt 后注入内容
 *
 * 如果存在 System Prompt，则将内容添加到现有 System Prompt 的结尾；如果不存在，则创建一个新的 System Prompt。
 *
 * @category Utilities
 */
export const appendSystem: {
  (content: string): (self: Prompt) => Prompt;
  (self: Prompt, content: string): Prompt;
} = dual(2, (self: Prompt, content: string): Prompt => {
  let system: SystemMessage | undefined = undefined;
  for (const message of self.messages) {
    if (message.role === "system") {
      system = makeMessage("system", {
        content: message.content + content,
      });
      break;
    }
  }
  if (Predicate.isUndefined(system)) {
    system = makeMessage("system", { content });
  }
  return makePrompt([system, ...self.messages]);
});

// #endregion
