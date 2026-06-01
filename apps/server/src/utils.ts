import * as Option from "effect/Option";

/**
 * 将 undefined 转换为 Option.none
 *
 * @example
 * ```ts
 * undefinedToOption(undefined) // Option.none()
 * undefinedToOption(1) // Option.some(1)
 * ```
 */
export const undefinedToOption = <T>(value: T): Option.Option<Exclude<T, undefined>> =>
  value === undefined ? Option.none() : Option.some(value as Exclude<T, undefined>);
