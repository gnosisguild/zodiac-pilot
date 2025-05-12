import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'

chrome.runtime.sendMessage<CompanionAppMessage>({
  type: CompanionAppMessageType.REQUEST_FORK_INFO,
})

export default {}
