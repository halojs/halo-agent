import * as Option from "effect/Option";

export const optionFromUndefinedOr = <A>(a: A): Option.Option<Exclude<A, undefined>> =>
  a === undefined ? Option.none() : Option.some(a as Exclude<A, undefined>);
