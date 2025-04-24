export type RecursivelyReplaceNullWithUndefined<T> = T extends null
  ? undefined // Note: Add interfaces here of all GraphQL scalars that will be transformed into an object
  : T extends Date
  ? T
  : {
      [K in keyof T]: T[K] extends (infer U)[]
        ? RecursivelyReplaceNullWithUndefined<U>[]
        : RecursivelyReplaceNullWithUndefined<T[K]>;
    };

/**
 * Recursively replaces all nulls with undefineds.
 * Skips object classes (that have a `.__proto__.constructor`).
 *
 * Unfortunately, until https://github.com/apollographql/apollo-client/issues/2412
 * gets solved at some point,
 * this is the only workaround to prevent `null`s going into the codebase,
 * if it's connected to a Apollo server/client.
 */
export function replaceNullsWithUndefineds<T>(obj: T): RecursivelyReplaceNullWithUndefined<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newObj: any = {};
  Object.keys(obj as object).forEach((k) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v: any = (obj as any)[k];
    newObj[k as keyof T] =
      v === null
        ? undefined
        : // eslint-disable-next-line no-proto
        v && typeof v === 'object' && v.__proto__.constructor === Object
        ? replaceNullsWithUndefineds(v)
        : v;
  });
  return newObj;
}

export type UndefinedProps<T extends object> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
};

/**
    type A = { a: null };

    const a: A = {}; // not valid
    const a1: A = { a: null }; // valid

    type B = RecursivelyReplaceNullWithUndefined<A>;

    const b: B = {}; // not valid
    const b2: B = { a: undefined }; // valid

    type C = MakeOptional<RecursivelyReplaceNullWithUndefined<A>>;

    const c: C = {}; // valid
    const c2: C = { a: undefined }; // valid
 */
export type MakeOptional<T extends object> = UndefinedProps<T> & Omit<T, keyof UndefinedProps<T>>;
