export type NullProperties<Base, Properties extends keyof Base = keyof Base> = {
  [P in keyof Base]-?: P extends Properties ? null : Base[P]
}
