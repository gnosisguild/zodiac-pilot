import { jsonStringify, JsonStringifyOptions } from './jsonStringify'

export const safeJson = <T>(data: T, options?: JsonStringifyOptions): T =>
  JSON.parse(jsonStringify(data, undefined, options))
