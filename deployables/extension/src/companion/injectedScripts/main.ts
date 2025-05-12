import { CompanionAppMessageType } from '@zodiac/messages'

window.addEventListener('click', (event) => {
  const target = event.target

  if (!(target instanceof HTMLElement)) {
    return
  }

  if (target.id !== 'ZODIAC-PILOT::open-panel-button') {
    return
  }

  window.postMessage({ type: CompanionAppMessageType.OPEN_PILOT }, '*')
})

export default {}
