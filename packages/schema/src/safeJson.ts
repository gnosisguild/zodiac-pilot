import { jsonStringify } from './jsonStringify'

export const safeJson = <T>(data: T): T => JSON.parse(jsonStringify(data))
