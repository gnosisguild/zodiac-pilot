import { sleepTillIdle } from '@zodiac/test-utils'

export function createPostMessage<T>() {
  return (message: T) => {
    window.postMessage(message, '*')

    return sleepTillIdle()
  }
}
