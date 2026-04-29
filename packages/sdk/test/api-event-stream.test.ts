import { describe, it, expect } from "@effect/vitest";
import { Effect } from "effect";
import { makeAssistantMessageEventStream } from "../src/api/event-stream";

describe("makeAssistantMessageEventStream", () => {
  it.effect("should create event stream successfully", () =>
    Effect.gen(function* () {
      const eventStream = yield* makeAssistantMessageEventStream();
      expect(eventStream).toBeDefined();
      expect(typeof eventStream.push).toBe("function");
      expect(typeof eventStream.result).toBe("function");
      expect(typeof eventStream[Symbol.asyncIterator]).toBe("function");
    }).pipe(Effect.asVoid),
  );

  it.effect("should handle event stream lifecycle", () =>
    Effect.gen(function* () {
      const eventStream = yield* makeAssistantMessageEventStream();
      const timestamp = Date.now();

      const basePartial = {
        role: "assistant" as const,
        api: "openai-completions" as const,
        provider: "deepseek" as const,
        model: "deepseek-chat",
        usage: {
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
          totalTokens: 0,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
        },
        stopReason: "stop" as const,
        timestamp,
      };

      // Push start event
      eventStream.push({
        type: "start",
        partial: { ...basePartial, content: [] },
      });

      // Push text_start event
      eventStream.push({
        type: "text_start",
        contentIndex: 0,
        partial: { ...basePartial, content: [] },
      });

      // Push text_delta events
      eventStream.push({
        type: "text_delta",
        contentIndex: 0,
        delta: "Hello",
        partial: { ...basePartial, content: [{ type: "text" as const, text: "Hello" }] },
      });

      eventStream.push({
        type: "text_delta",
        contentIndex: 0,
        delta: " world",
        partial: { ...basePartial, content: [{ type: "text" as const, text: "Hello world" }] },
      });

      // Push text_end event
      eventStream.push({
        type: "text_end",
        contentIndex: 0,
        content: "Hello world",
        partial: { ...basePartial, content: [{ type: "text" as const, text: "Hello world" }] },
      });

      // Push thinking_start event
      eventStream.push({
        type: "thinking_start",
        contentIndex: 1,
        partial: { ...basePartial, content: [{ type: "text" as const, text: "Hello world" }] },
      });

      // Push thinking_delta event
      eventStream.push({
        type: "thinking_delta",
        contentIndex: 1,
        delta: "Let me think",
        partial: {
          ...basePartial,
          content: [
            { type: "text" as const, text: "Hello world" },
            { type: "thinking" as const, thinking: "Let me think" },
          ],
        },
      });

      // Push thinking_end event
      eventStream.push({
        type: "thinking_end",
        contentIndex: 1,
        content: "Let me think about this",
        partial: {
          ...basePartial,
          content: [
            { type: "text" as const, text: "Hello world" },
            { type: "thinking" as const, thinking: "Let me think about this" },
          ],
        },
      });

      // Push toolcall_start event
      eventStream.push({
        type: "toolcall_start",
        contentIndex: 2,
        partial: {
          ...basePartial,
          content: [
            { type: "text" as const, text: "Hello world" },
            { type: "thinking" as const, thinking: "Let me think about this" },
          ],
        },
      });

      // Push toolcall_delta event
      eventStream.push({
        type: "toolcall_delta",
        contentIndex: 2,
        delta: '{"arg": "val"',
        partial: {
          ...basePartial,
          content: [
            { type: "text" as const, text: "Hello world" },
            { type: "thinking" as const, thinking: "Let me think about this" },
          ],
        },
      });

      // Push toolcall_end event
      const toolCall = {
        type: "toolCall" as const,
        id: "call_123",
        name: "search",
        arguments: { query: "hello" },
      };

      eventStream.push({
        type: "toolcall_end",
        contentIndex: 2,
        toolCall,
        partial: {
          ...basePartial,
          content: [
            { type: "text" as const, text: "Hello world" },
            { type: "thinking" as const, thinking: "Let me think about this" },
            toolCall,
          ],
        },
      });

      // Push done event
      const finalMessage = {
        role: "assistant" as const,
        content: [
          { type: "text" as const, text: "Hello world" },
          { type: "thinking" as const, thinking: "Let me think about this" },
          toolCall,
        ],
        api: "openai-completions" as const,
        provider: "deepseek" as const,
        model: "deepseek-chat",
        usage: {
          input: 10,
          output: 5,
          cacheRead: 0,
          cacheWrite: 0,
          totalTokens: 15,
          cost: { input: 0.001, output: 0.002, cacheRead: 0, cacheWrite: 0, total: 0.003 },
        },
        stopReason: "stop" as const,
        timestamp,
      };

      eventStream.push({
        type: "done",
        reason: "stop",
        message: finalMessage,
      });

      // Verify result
      const result = yield* Effect.promise(() => eventStream.result());
      expect(result).toEqual(finalMessage);
    }).pipe(Effect.asVoid),
  );

  it.effect("should handle error events", () =>
    Effect.gen(function* () {
      const eventStream = yield* makeAssistantMessageEventStream();

      const errorMessage = {
        role: "assistant" as const,
        content: [],
        api: "openai-completions" as const,
        provider: "deepseek" as const,
        model: "deepseek-chat",
        usage: {
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
          totalTokens: 0,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
        },
        stopReason: "error" as const,
        errorMessage: "API rate limit exceeded",
        timestamp: Date.now(),
      };

      eventStream.push({
        type: "error",
        reason: "error",
        error: errorMessage,
      });

      const result = yield* Effect.promise(() => eventStream.result());
      expect(result).toEqual(errorMessage);
    }).pipe(Effect.asVoid),
  );

  it.effect("should iterate through events", () =>
    Effect.gen(function* () {
      const eventStream = yield* makeAssistantMessageEventStream();

      const events = [
        { type: "start" as const, contentIndex: 0, partial: {} as any },
        { type: "text_delta" as const, contentIndex: 0, delta: "Hello", partial: {} as any },
        { type: "text_end" as const, contentIndex: 0, content: "Hello", partial: {} as any },
      ];

      // Push events
      for (const event of events) {
        eventStream.push(event);
      }

      // End the stream
      eventStream.push({
        type: "done",
        reason: "stop",
        message: {
          role: "assistant",
          content: [{ type: "text", text: "Hello" }],
          api: "openai-completions",
          provider: "deepseek",
          model: "deepseek-chat",
          usage: {
            input: 0,
            output: 0,
            cacheRead: 0,
            cacheWrite: 0,
            totalTokens: 0,
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
          },
          stopReason: "stop",
          timestamp: Date.now(),
        },
      });

      // Collect events via iteration
      const collectedEvents = yield* Effect.promise(async () => {
        const items: any[] = [];
        for await (const event of eventStream) {
          items.push(event);
        }
        return items;
      });

      expect(collectedEvents).toHaveLength(4);
      expect(collectedEvents[0].type).toBe("start");
      expect(collectedEvents[1].type).toBe("text_delta");
      expect(collectedEvents[2].type).toBe("text_end");
      expect(collectedEvents[3].type).toBe("done");
    }).pipe(Effect.asVoid),
  );

  it.effect("should handle multiple result calls", () =>
    Effect.gen(function* () {
      const eventStream = yield* makeAssistantMessageEventStream();

      const finalMessage = {
        role: "assistant" as const,
        content: [],
        api: "openai-completions" as const,
        provider: "deepseek" as const,
        model: "deepseek-chat",
        usage: {
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
          totalTokens: 0,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
        },
        stopReason: "stop" as const,
        timestamp: Date.now(),
      };

      eventStream.push({
        type: "done",
        reason: "stop",
        message: finalMessage,
      });

      // Multiple calls to result should return the same value
      const result1 = yield* Effect.promise(() => eventStream.result());
      const result2 = yield* Effect.promise(() => eventStream.result());

      expect(result1).toEqual(finalMessage);
      expect(result2).toEqual(finalMessage);
    }).pipe(Effect.asVoid),
  );
});
