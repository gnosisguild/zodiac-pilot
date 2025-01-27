import { client } from './client'

export const captureLastError = () => {
  if (chrome.runtime.lastError == null) {
    return
  }

  client.captureException(chrome.runtime.lastError)
}
