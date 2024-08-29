import { Message, PILOT_CONNECT, PILOT_DISCONNECT } from './messages'

const PILOT_CONNECTED_STATE = 'ZodiacPilot::Connected'

window.addEventListener('message', (ev: MessageEvent<Message>) => {
  const message = ev.data
  if (!message) return

  if (message.type === PILOT_CONNECT) {
    localStorage.setItem(PILOT_CONNECTED_STATE, 'true')
  }

  if (message.type === PILOT_DISCONNECT) {
    localStorage.setItem(PILOT_CONNECTED_STATE, 'false')
  }
})

export const isPilotConnected = () => {
  return localStorage.getItem(PILOT_CONNECTED_STATE) === 'true'
}
