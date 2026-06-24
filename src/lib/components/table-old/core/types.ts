type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export type DotNestedKeys<TValue> = TValue extends Primitive
  ? never
  : {
      [TKey in Extract<keyof TValue, string>]: TValue[TKey] extends Primitive | unknown[]
        ? TKey
        : TKey | `${TKey}.${DotNestedKeys<TValue[TKey]>}`;
    }[Extract<keyof TValue, string>];

export type DotNestedValue<TValue, TPath extends string> = TPath extends `${infer THead}.${infer TTail}`
  ? THead extends keyof TValue
    ? DotNestedValue<TValue[THead], TTail>
    : unknown
  : TPath extends keyof TValue
    ? TValue[TPath]
    : unknown;
