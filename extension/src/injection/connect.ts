import { USER_WALLET_REQUEST, USER_WALLET_RESPONSE } from '../messages'

// relay window messages to the injected provider
window.addEventListener('message', async (message) => {
  if (message.data.type === USER_WALLET_REQUEST) {
    console.log('CONNECT MESSAGE', message, message.source)
    if (!window.ethereum) {
      throw new Error('No ethereum provider')
    }

    const response = await window.ethereum.request(message.data.request)

    window.top!.postMessage(
      {
        type: USER_WALLET_RESPONSE,
        response,
      },
      '*'
    )
  }
})
