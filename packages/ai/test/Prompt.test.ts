import { it, expect, describe } from "@effect/vitest";
import * as Prompt from "~/Prompt";

describe("Prompt", () => {
  it("should be make a text content", () => {
    const content = Prompt.textContent({
      text: "Hello, world!",
    });

    expect(Prompt.isContent(content)).toBe(true);
    expect(content).toHaveProperty("type", "text");
    expect(content).toHaveProperty("text", "Hello, world!");
  });

  it("should be make a reasoning content", () => {
    const content = Prompt.reasoningContent({
      reasoning: "I think this is a test.",
    });

    expect(Prompt.isContent(content)).toBe(true);
    expect(content).toHaveProperty("type", "reasoning");
    expect(content).toHaveProperty("reasoning", "I think this is a test.");
  });

  it("should be make a image content", () => {
    const content = Prompt.fileContent({
      mediaType: "image/png",
      fileName: "test.png",
      data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
    });

    expect(Prompt.isContent(content)).toBe(true);
    expect(content).toHaveProperty("type", "file");
    expect(content).toHaveProperty("mediaType", "image/png");
    expect(content).toHaveProperty("fileName", "test.png");
    expect(content).toHaveProperty("data", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA");
  });

  it("should be make a file content with optional fileName", () => {
    const content = Prompt.fileContent({
      mediaType: "application/pdf",
      data: "data:application/pdf;base64,test",
    });

    expect(Prompt.isContent(content)).toBe(true);
    expect(content).toHaveProperty("type", "file");
    expect(content).toHaveProperty("mediaType", "application/pdf");
    expect(content).not.toHaveProperty("fileName");
    expect(content).toHaveProperty("data", "data:application/pdf;base64,test");
  });

  it("should be make a tool call", () => {
    const content = Prompt.toolCall({
      id: "test-tool",
      name: "Test Tool",
      arguments: {
        query: "Hello, world!",
      },
    });

    expect(Prompt.isContent(content)).toBe(true);
    expect(content).toHaveProperty("type", "tool-call");
    expect(content).toHaveProperty("id", "test-tool");
    expect(content).toHaveProperty("name", "Test Tool");
    expect(content).toHaveProperty("arguments", {
      query: "Hello, world!",
    });
  });

  it("should be make a system message", () => {
    const message = Prompt.systemMessage({
      content: "System message content",
    });

    expect(Prompt.isMessage(message)).toBe(true);
    expect(message).toHaveProperty("role", "system");
    expect(message).toHaveProperty("content", "System message content");
    expect(message).toHaveProperty("options", {});
    expect(message).toHaveProperty("timestamp");
  });

  it("should be make a user message", () => {
    const message = Prompt.userMessage({
      content: [
        Prompt.textContent({
          text: "User message content",
        }),
        Prompt.fileContent({
          mediaType: "image/png",
          fileName: "test.png",
          data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
        }),
      ],
    });

    expect(Prompt.isMessage(message)).toBe(true);
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

  it("should be make an assistant message", () => {
    const message = Prompt.assistantMessage({
      api: "openai-completions",
      provider: "openai",
      model: "gpt-4",
      content: [
        Prompt.textContent({
          text: "Assistant message content",
        }),
      ],
      stopReason: "stop",
    });

    expect(Prompt.isMessage(message)).toBe(true);
    expect(message).toHaveProperty("role", "assistant");
    expect(message).toHaveProperty("api", "openai-completions");
    expect(message).toHaveProperty("provider", "openai");
    expect(message).toHaveProperty("model", "gpt-4");
    expect(message.content).toHaveLength(1);
    expect(message.content[0]).toHaveProperty("type", "text");
    expect(message.content[0]).toHaveProperty("text", "Assistant message content");
    expect(message).toHaveProperty("stopReason", "stop");
  });

  it("should be make a tool result message", () => {
    const message = Prompt.toolResultMessage({
      id: "tool-result-1",
      name: "Test Tool",
      content: [
        Prompt.textContent({
          text: "Tool result content",
        }),
      ],
    });

    expect(Prompt.isMessage(message)).toBe(true);
    expect(message).toHaveProperty("role", "tool-result");
    expect(message).toHaveProperty("id", "tool-result-1");
    expect(message).toHaveProperty("name", "Test Tool");
    expect(message.content).toHaveLength(1);
    expect(message.content[0]).toHaveProperty("type", "text");
    expect(message.content[0]).toHaveProperty("text", "Tool result content");
  });
});
