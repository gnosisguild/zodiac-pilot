export type NonNullableProperties<
  Base,
  Properties extends keyof Base = keyof Base,
> = {
  [P in keyof Base]-?: P extends Properties ? NonNullable<Base[P]> : Base[P]
}
