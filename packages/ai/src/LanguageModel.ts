/**
 * 提供 AI 文本生成功能及工具调用
 *
 * 支持流式和非流式文本生成的语言模型，结构化输出生成和工具调用功能。
 */
import type { NoExcessProperties } from "effect/Types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import * as Prompt from "./Prompt";
import * as Response from "./Response";
import * as Tool from "./Tool";

export class LanguageModel extends Context.Tag("@halo/ai/LanguageModel")<
  LanguageModel,
  Service
>() {}

export interface Service {
  /**
   * 生成文本
   */
  readonly generateText: <
    Options extends NoExcessProperties<GenerateTextOptions<Tools>, Options>,
    Tools extends Record<string, Tool.Tool> = {},
  >(
    options: Options & GenerateTextOptions<Tools>,
  ) => Effect.Effect<GenerateTextEventStream>;

  /**
   * 流式生成
   */
  readonly streamText: <
    Options extends NoExcessProperties<GenerateTextOptions<Tools>, Options>,
    Tools extends Record<string, Tool.Tool> = {},
  >(
    options: Options & GenerateTextOptions<Tools>,
  ) => Stream.Stream<Response.EventStream>;
}

export interface GenerateTextOptions<Tools extends Record<string, Tool.Tool>> {
  /**
   * 提示词
   */
  readonly prompt: Prompt.RawInput;

  /**
   * 可调用工具
   */
  readonly tools?: Tools;

  /**
   * 附加选项
   */
  readonly options?: {
    /**
     * 工具选择
     */
    toolChoice?: ToolChoice<{ [Name in keyof Tools]: Tools[Name]["name"] }[keyof Tools]>;

    /**
     * 采样温度
     */
    temperature?: number;

    /**
     * 限制一次请求中模型生成 completion 的最大 token 数
     */
    maxTokens?: number;

    /**
     * 提供商会话 ID
     */
    sessionId?: string;

    /**
     * 自定义 Headers
     */
    headers?: Record<string, string>;

    /**
     * 请求超时时间（毫秒）
     */
    timeoutMs?: number;

    /**
     * 请求失败重试次数
     */
    maxRetries?: number;

    /**
     * 请示失败重试延时（毫秒）
     */
    maxRetryDelayMs?: number;

    /**
     * 元数据，适配不同提供商的特定字段
     */
    metadata?: Record<string, unknown>;
  };
}

export type ToolChoice<Tools extends string> =
  | "none"
  | "auto"
  | "required"
  | {
      readonly tool: Tools;
    }
  | {
      readonly mode?: "auto" | "required";
      readonly oneOf: ReadonlyArray<Tools>;
    };

export class GenerateTextEventStream {
  readonly eventStream: Array<Response.EventStream>;

  constructor(eventStream: Array<Response.EventStream>) {
    this.eventStream = eventStream;
  }

  /**
   * 从 API 响应中提取并串接所有文字回复部分
   */
  get text(): string {
    const text: Array<string> = [];
    for (const partial of this.eventStream) {
      if (partial.type === "text-delta") {
        text.push(partial.delta);
      }
    }
    return text.join("");
  }

  /**
   * 返回全部思考部分
   */
  get reasoning(): Array<Response.ReasoningDeltaEvent> {
    return this.eventStream.filter((partial) => partial.type === "reasoning-delta");
  }

  /**
   * 提取并串接所有推理文本，若无则 undefined
   */
  get reasoningText(): string | undefined {
    const text: Array<string> = [];
    for (const partial of this.eventStream) {
      if (partial.type === "reasoning-delta") {
        text.push(partial.delta);
      }
    }
    return text.length === 0 ? undefined : text.join("");
  }

  /**
   * 从 API 响应中提取并串接所有工具调用部分
   */
  get toolCalls(): Array<Response.ToolCallDeltaEvent> {
    return this.eventStream.filter((event) => event.type === "toolcall-delta");
  }

  /**
   * 返回停止原因
   */
  get stopReason(): Response.DoneEvent["reason"] | "unknown" {
    const doneEvent = this.eventStream.find((event) => event.type === "done");
    return Predicate.isUndefined(doneEvent) ? "unknown" : doneEvent.reason;
  }

  /**
   * 返回 Tokens 用量
   */
  get usage(): Response.Usage {
    const doneEvent = this.eventStream.find((event) => event.type === "done");
    if (Predicate.isUndefined(doneEvent)) {
      return new Response.Usage({
        input: 0,
        output: 0,
      });
    }
    return doneEvent.usage;
  }
}

// -----------------------------------------------------------------------------
// #region (Constructors)

// #endregion

// -----------------------------------------------------------------------------
// #region (Accessors)

/**
 * 生成文本
 *
 * @category Accessors
 */
export const generateText: <
  Options extends NoExcessProperties<GenerateTextOptions<Tools>, Options>,
  Tools extends Record<string, Tool.Tool> = {},
>(
  options: Options & GenerateTextOptions<Tools>,
) => Effect.Effect<GenerateTextEventStream, never, LanguageModel> = Effect.serviceFunctionEffect(
  LanguageModel,
  (model) => model.generateText,
);

/**
 * 流式生成文本
 *
 * @category Accessors
 */
export const streamText = <
  Options extends NoExcessProperties<GenerateTextOptions<Tools>, Options>,
  Tools extends Record<string, Tool.Tool> = {},
>(
  options: Options & GenerateTextOptions<Tools>,
): Stream.Stream<Response.EventStream, never, LanguageModel> =>
  Stream.unwrap(LanguageModel.pipe(Effect.map((model) => model.streamText(options))));

// #endregion
