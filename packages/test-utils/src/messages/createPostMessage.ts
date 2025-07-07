import { sleepTillIdle } from '@zodiac/test-utils'

export function createPostMessage<T>() {
  return async (message: T) => {
    await sleepTillIdle()

    window.postMessage(message, '*')

    return sleepTillIdle()
  }
}
