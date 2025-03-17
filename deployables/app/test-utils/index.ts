import type {
  CompanionAppMessage,
  CompanionResponseMessage,
  Message,
} from '@zodiac/messages'
import { createExpectMessage, createPostMessage } from '@zodiac/test-utils'

export { createMockChain } from './createMockChain'
export { createMockTokenBalance } from './createMockTokenBalance'
export { loadRoutes } from './loadRoutes'
export { render } from './render'
export * from './wallet'

export const postMessage = createPostMessage<
  CompanionAppMessage | CompanionResponseMessage | Message
>()

export const expectMessage = await createExpectMessage<
  CompanionAppMessage | CompanionResponseMessage
>()
