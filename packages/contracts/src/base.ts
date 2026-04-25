import { Schema } from "effect";

export const TrimmedString = Schema.Trim;
export const TrimmedNonEmptyString = TrimmedString.pipe(Schema.filter((s) => s.length > 0));

export const NonNegativeInt = Schema.Int.pipe(Schema.filter((n) => n >= 0));
export const PositiveInt = Schema.Int.pipe(Schema.filter((n) => n > 0));

export const IsoDateTime = Schema.String;
export type IsoDateTime = typeof IsoDateTime.Type;
