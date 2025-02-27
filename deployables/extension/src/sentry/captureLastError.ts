import { client } from './client'

export const captureLastError = () => {
  if (chrome.runtime.lastError == null) {
    return
  }

  console.warn(chrome.runtime.lastError)

  client.captureException(chrome.runtime.lastError)
}
