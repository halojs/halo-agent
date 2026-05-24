import { it, expect, describe } from "@effect/vitest";
import * as Schema from "effect/Schema";
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

  it("should be get tool json schema", () => {
    const tool = Tool.make("test-tool", {
      label: "Test Tool",
      description: "A test tool",
      parameters: {
        string: Schema.String,
        union: Schema.Union(Schema.String, Schema.Number),
        literal: Schema.Literal("foo", "bar"),
      },
    });

    expect(Tool.getJsonSchema(tool)).toMatchInlineSnapshot(`
      {
        "additionalProperties": false,
        "properties": {
          "literal": {
            "enum": [
              "foo",
              "bar",
            ],
            "type": "string",
          },
          "string": {
            "type": "string",
          },
          "union": {
            "anyOf": [
              {
                "type": "string",
              },
              {
                "type": "number",
              },
            ],
          },
        },
        "required": [
          "string",
          "union",
          "literal",
        ],
        "type": "object",
      }
    `);
  });
});
