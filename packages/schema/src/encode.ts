import { jsonStringify } from './jsonStringify'

export const encode = (value: unknown) => btoa(jsonStringify(value))
