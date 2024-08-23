import { Eip1193Provider } from '../types'
import {
  USER_WALLET_EVENT,
  USER_WALLET_REQUEST,
  USER_WALLET_ERROR,
  USER_WALLET_RESPONSE,
  Message,
  USER_WALLET_INITIALIZED,
} from './messages'

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

// relay window messages to the injected provider
window.addEventListener('message', async (event: MessageEvent<Message>) => {
  const message = event.data
  if (message.type === USER_WALLET_REQUEST) {
    if (!window.ethereum) {
      throw new Error('No ethereum provider')
    }

    try {
      const response = await window.ethereum.request(message.request)
      window.top!.postMessage(
        {
          type: USER_WALLET_RESPONSE,
          requestId: message.requestId,
          response,
        } satisfies Message,
        '*'
      )
    } catch (err) {
      console.error('Error sending request to window.ethereum', message, err)
      window.top!.postMessage(
        {
          type: USER_WALLET_ERROR,
          requestId: message.requestId,
          error: {
            message: (err as any).message,
            code: (err as any).code,
          },
        } satisfies Message,
        '*'
      )
    }
  }
})

// relay the relevant events from the injected provider to the parent window
const relayEvent = (eventName: string) => {
  if (!window.ethereum) {
    throw new Error('No ethereum provider')
  }

  window.ethereum.on(eventName, (eventData: unknown) => {
    window.top!.postMessage(
      {
        type: USER_WALLET_EVENT,
        eventName,
        eventData,
      } satisfies Message,
      '*'
    )
  })
}

const initProvider = () => {
  window.top!.postMessage(
    {
      type: USER_WALLET_INITIALIZED,
    },
    '*'
  )

  relayEvent('accountsChanged')
  relayEvent('chainChanged')
  relayEvent('disconnect')
}

if (!window.ethereum) {
  initProvider()
} else {
  const handleInitialize = () => {
    window.removeEventListener('ethereum#initialized', handleInitialize)
    initProvider()
  }
  window.addEventListener('ethereum#initialized', handleInitialize)
}
