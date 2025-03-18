import type {
  CompanionAppMessage,
  CompanionResponseMessage,
} from '@zodiac/messages'
import { createExpectMessage } from '@zodiac/test-utils'

export { createMockChain } from './createMockChain'
export { createMockTokenBalance } from './createMockTokenBalance'
export { loadRoutes } from './loadRoutes'
export { postMessage } from './postMessage'
export { regexEscape } from './regexEscape'
export { render } from './render'
export * from './wallet'

export const expectMessage = await createExpectMessage<
  CompanionAppMessage | CompanionResponseMessage
>()
