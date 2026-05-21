import { it, expect, describe } from "@effect/vitest";
import * as Message from "~/conversation/message";

describe("Message", () => {
  it("should be make text content", () => {
    const content = Message.textContent({
      text: "Hello, world!",
    });

    expect(Message.isContent(content)).toBe(true);
    expect(content).toHaveProperty("type", "text");
    expect(content).toHaveProperty("text", "Hello, world!");
  });

  it("should be make reasoning content", () => {
    const content = Message.reasoningContent({
      reasoning: "I think this is a test.",
    });

    expect(Message.isContent(content)).toBe(true);
    expect(content).toHaveProperty("type", "reasoning");
    expect(content).toHaveProperty("reasoning", "I think this is a test.");
  });

  it("should be make image content", () => {
    const content = Message.fileContent({
      mediaType: "image/png",
      fileName: "test.png",
      data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
    });

    expect(Message.isContent(content)).toBe(true);
    expect(content).toHaveProperty("type", "file");
    expect(content).toHaveProperty("mediaType", "image/png");
    expect(content).toHaveProperty("fileName", "test.png");
    expect(content).toHaveProperty("data", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA");
  });

  it("should be make file content with optional fileName", () => {
    const content = Message.fileContent({
      mediaType: "application/pdf",
      data: "data:application/pdf;base64,test",
    });

    expect(Message.isContent(content)).toBe(true);
    expect(content).toHaveProperty("type", "file");
    expect(content).toHaveProperty("mediaType", "application/pdf");
    expect(content).not.toHaveProperty("fileName");
    expect(content).toHaveProperty("data", "data:application/pdf;base64,test");
  });

  it("should be make tool call", () => {
    const content = Message.toolCall({
      id: "test-tool",
      name: "Test Tool",
      arguments: {
        query: "Hello, world!",
      },
    });

    expect(Message.isContent(content)).toBe(true);
    expect(content).toHaveProperty("type", "toolCall");
    expect(content).toHaveProperty("id", "test-tool");
    expect(content).toHaveProperty("name", "Test Tool");
    expect(content).toHaveProperty("arguments", {
      query: "Hello, world!",
    });
  });

  it("should be make system message", () => {
    const message = Message.systemMessage({
      content: "System message content",
    });

    expect(Message.isMessage(message)).toBe(true);
    expect(message).toHaveProperty("role", "system");
    expect(message).toHaveProperty("content", "System message content");
    expect(message).toHaveProperty("options", {});
    expect(message).toHaveProperty("timestamp");
  });

  it("should be make user message", () => {
    const message = Message.userMessage({
      content: [
        Message.textContent({
          text: "User message content",
        }),
        Message.fileContent({
          mediaType: "image/png",
          fileName: "test.png",
          data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
        }),
      ],
    });

    expect(Message.isMessage(message)).toBe(true);
    expect(message).toHaveProperty("role", "user");
    expect(message.content).toHaveLength(2);
    expect(message.content[0]).toHaveProperty("type", "text");
    expect(message.content[0]).toHaveProperty("text", "User message content");
    expect(message.content[1]).toHaveProperty("type", "file");
    expect(message.content[1]).toHaveProperty("mediaType", "image/png");
    expect(message.content[1]).toHaveProperty("fileName", "test.png");
    expect(message.content[1]).toHaveProperty(
      "data",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
    );
  });

  it("should be make assistant message", () => {
    const message = Message.assistantMessage({
      api: "openai-completions",
      provider: "openai",
      model: "gpt-4",
      content: [
        Message.textContent({
          text: "Assistant message content",
        }),
      ],
      stopReason: "stop",
    });

    expect(Message.isMessage(message)).toBe(true);
    expect(message).toHaveProperty("role", "assistant");
    expect(message).toHaveProperty("api", "openai-completions");
    expect(message).toHaveProperty("provider", "openai");
    expect(message).toHaveProperty("model", "gpt-4");
    expect(message.content).toHaveLength(1);
    expect(message.content[0]).toHaveProperty("type", "text");
    expect(message.content[0]).toHaveProperty("text", "Assistant message content");
    expect(message).toHaveProperty("stopReason", "stop");
  });

  it("should be make tool result message", () => {
    const message = Message.toolResultMessage({
      id: "tool-result-1",
      name: "Test Tool",
      content: [
        Message.textContent({
          text: "Tool result content",
        }),
      ],
    });

    expect(Message.isMessage(message)).toBe(true);
    expect(message).toHaveProperty("role", "toolResult");
    expect(message).toHaveProperty("id", "tool-result-1");
    expect(message).toHaveProperty("name", "Test Tool");
    expect(message.content).toHaveLength(1);
    expect(message.content[0]).toHaveProperty("type", "text");
    expect(message.content[0]).toHaveProperty("text", "Tool result content");
  });
});
