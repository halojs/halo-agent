import { it, expect, describe } from "@effect/vitest";
import * as Tool from "~/Tool";

describe("Tool", () => {
  it("should be make a tool", () => {
    const tool = Tool.make("test-tool", {
      label: "Test Tool",
      description: "A test tool",
    });

    expect(tool).toHaveProperty("name", "test-tool");
    expect(tool).toHaveProperty("description", "A test tool");
    expect(tool).toHaveProperty("executionMode", "sequential");
    expect(tool).toHaveProperty("failureMode", "error");
  });
});
