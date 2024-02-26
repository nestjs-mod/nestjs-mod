export type Observabled<T> = T extends null | undefined
  ? T // special case for `null | undefined` when not in `--strictNullChecks` mode
  : T extends object & {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subscribe(onfulfilled: infer F, ...args: infer _): any;
    } // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    F extends (value: infer V, ...args: infer _) => any // if the argument to `then` is callable, extracts the first argument
    ? Observabled<V> // recursively unwrap the value
    : never // the argument to `then` was not callable
  : T; // non-object or non-thenable
