import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

// -----------------------------------------------------------------------------
// #region (TypeIds)

export const TypeId = "@effect/ai/Tool";
export type TypeId = typeof TypeId;

// #endregion

// -----------------------------------------------------------------------------
// #region (Type Guards)

export const isTool = (u: unknown): u is Tool<string> => Predicate.hasProperty(u, TypeId);

// #endregion

// -----------------------------------------------------------------------------
// #region (Tool)

export interface Tool<Name extends string = string, Parameters extends Schema.Struct.Fields = {}> {
  readonly [TypeId]: TypeId;
  readonly id: string;
  readonly name: Name;
  readonly description: string;
  readonly parameters: Parameters;
}

export interface ToolEncoded<
  Name extends string = string,
  Parameters extends Schema.Struct.Fields = {},
> {
  readonly id: string;
  readonly name: Name;
  readonly description: string;
  readonly parameters?: Parameters;
}

export const Tool: Schema.Schema<Tool, ToolEncoded> = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  description: Schema.String,
  parameters: Schema.optionalWith(Schema.Struct({}), {
    default: () => ({}),
  }),
}).pipe(Schema.attachPropertySignature(TypeId, TypeId), Schema.annotations({ identifier: "Tool" }));

export const make = <const Name extends Tool["name"]>(
  name: Name,
  params: Omit<Tool<Name>, TypeId | "id" | "name" | "parameters"> & {
    parameters?: Extract<Tool<Name>, { name: Name }>["parameters"];
  },
): Extract<Tool<Name>, { name: Name }> => ({
  ...params,
  [TypeId]: TypeId,
  id: `@halo/ai/Tool/${name}`,
  name,
  parameters: params.parameters ?? {},
});

// #endregion
