import { jsonParse } from './jsonParse'

export const decode = (data: string) => jsonParse(atob(data).toString())
