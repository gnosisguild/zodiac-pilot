import { EventEmitter } from 'events'
import { Eip1193Provider } from '../types'
import {
  Message,
  USER_WALLET_ERROR,
  USER_WALLET_EVENT,
  USER_WALLET_INITIALIZED,
  USER_WALLET_REQUEST,
  USER_WALLET_RESPONSE,
} from './messages'

interface JsonRpcRequest {
  method: string
  params?: Array<any>
}

export class InjectedWalletError extends Error {
  code: number
  constructor(message: string, code: number) {
    super(message)
    this.code = code
  }
}

let instanceCounter = 0

export default class ConnectProvider
  extends EventEmitter
  implements Eip1193Provider
{
  private initialized = false
  private instanceId = instanceCounter++
  private messageCounter = 0

  private emittedEventIds = new Set<string>()

  constructor() {
    super()
    if (!window.top) throw new Error('Must run inside iframe')

    chrome.runtime.onMessage.addListener(this.#handleMessage)
  }

  isInitialized = (): boolean => {
    return this.initialized
  }

  request = (request: JsonRpcRequest): Promise<any> => {
    const requestId = `${this.instanceId}:${this.messageCounter}`
    this.messageCounter++

    return new Promise((resolve, reject) => {
      chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
        if (tabs.length === 0 || !tabs[0].id) throw new Error('no tab found')

        console.log('[connect/ConnectProvider] posting msg to tab', tabs[0])
        const responseMessage: Message = await chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: USER_WALLET_REQUEST,
            requestId,
            request,
          } as Message
        )

        if (responseMessage.type === USER_WALLET_RESPONSE) {
          resolve(responseMessage.response)
        } else if (responseMessage.type === USER_WALLET_ERROR) {
          const error = new InjectedWalletError(
            responseMessage.error.message,
            responseMessage.error.code
          )
          reject(error)
        } else {
          console.error('Unexpected response', responseMessage)
          throw new Error('Unexpected response')
        }
      })
    })
  }

  #handleMessage = (message: Message, sender: chrome.runtime.MessageSender) => {
    console.log(
      '[connect/ConnectProvider] chrome.runtime.onMessage',
      message,
      sender
    )
    if (message.type === USER_WALLET_INITIALIZED) {
      this.initialized = true
    }
    if (message.type === USER_WALLET_EVENT) {
      this.#emitOnce(message.eventName, message.eventData)
    }
    return false
  }

  /** Wallet events will be relayed multiple times, once from each tab with a connect iframe. So we need to deduplicate. */
  #emitOnce = (eventName: string, eventData: any) => {
    const eventId = eventName + JSON.stringify(eventData)
    if (this.emittedEventIds.has(eventId)) return
    this.emittedEventIds.add(eventId)
    this.emit(eventName, eventData)
    window.setTimeout(() => {
      this.emittedEventIds.delete(eventId)
    }, 1)
  }
}
