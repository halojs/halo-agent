import type { Covariant } from "effect/Types";
import { identity } from "effect/Function";
import * as JsonSchema from "effect/JSONSchema";
import { pipeArguments, type Pipeable } from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import * as AST from "effect/SchemaAST";

// -----------------------------------------------------------------------------
// #region (Tool)

export const TypeId = "@effect/ai/Tool";

export type TypeId = typeof TypeId;

export const isTool = (u: unknown): u is Tool<string> => Predicate.hasProperty(u, TypeId);

export type ExecutionMode = "sequential" | "parallel";

export type FailureMode = "error" | "return";

export interface Tool<
  Name extends string = string,
  Parameters extends Schema.Struct.Fields = {},
> extends Pipeable {
  readonly [TypeId]: {
    readonly _Requirements: Covariant<any>;
  };
  /**
   * 工具名称
   */
  readonly name: Name;
  /**
   * 工具显示名称，用于 UI 展示
   */
  readonly label: string;
  /**
   * 工具描述信息
   */
  readonly description: string;
  /**
   * 工具参数结构定义
   */
  readonly parameters: Schema.Struct<Parameters>;
  /**
   * 工具执行模式，决定多个工具调用时的执行方式
   */
  readonly executionMode: ExecutionMode;
  /**
   * 工具失败模式，决定工具执行失败时的处理方式
   */
  readonly failureMode: FailureMode;
}

const Proto = {
  [TypeId]: { _Requirements: identity },
  pipe() {
    return pipeArguments(this, arguments);
  },
};

export const make = <const Name extends string, Parameters extends Schema.Struct.Fields = {}>(
  name: Name,
  options?: {
    readonly label: string;
    readonly description: string;
    readonly parameters?: Parameters;
    readonly executionMode?: ExecutionMode;
    readonly failureMode?: FailureMode;
  },
): Tool<Name, Parameters> => {
  return Object.assign(Object.create(Proto), {
    name,
    label: options?.label || name,
    description: options?.description,
    parameters: options?.parameters ? Schema.Struct(options?.parameters as any) : Schema.Struct({}),
    executionMode: options?.executionMode ?? "sequential",
    failureMode: options?.failureMode ?? "error",
  });
};

// #endregion

// -----------------------------------------------------------------------------
// #region (Utilities)

/**
 * 获得工具的 JSON Schema
 *
 * @category Utilities
 */
export const getJsonSchema = <
  const Name extends string,
  Parameters extends Schema.Struct.Fields = {},
>(
  tool: Tool<Name, Parameters>,
): JsonSchema.JsonSchema7 => getJsonSchemaFromSchemaAst(tool.parameters.ast);

/**
 * 根据 Schema AST 返回 JSON Schema
 *
 * @category Utilities
 */
export const getJsonSchemaFromSchemaAst = (ast: AST.AST): JsonSchema.JsonSchema7 => {
  const $defs = {};
  const schema = JsonSchema.fromAST(ast, {
    definitions: $defs,
    topLevelReferenceStrategy: "skip",
  });

  if (Object.keys($defs).length === 0) return schema;
  (schema as any).$defs = $defs;
  return schema;
};

// #region
