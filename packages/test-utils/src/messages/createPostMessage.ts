import { sleepTillIdle } from '@zodiac/test-utils'

export function createPostMessage<T>() {
  return async (message: T) => {
    window.postMessage(message, '*')

    return sleepTillIdle()
  }
}
