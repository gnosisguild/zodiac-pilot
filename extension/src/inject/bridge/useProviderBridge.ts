// this will be bundled in the panel app
import { InjectedProviderMessage, InjectedProviderMessageTyp } from '@/messages'
import { Eip1193Provider } from '@/types'
import { getActiveTab, sendMessageToTab } from '@/utils'
import { invariant } from '@epic-web/invariant'
import { toQuantity } from 'ethers'
import { useCallback, useEffect, useRef } from 'react'
import { ChainId } from 'ser-kit'
import { useWindowId } from './BridgeContext'

const emitEvent = async (eventName: string, eventData: any) => {
  const tab = await getActiveTab()

  invariant(tab.id != null, 'Can only send events to tabs that have an ID')

  sendMessageToTab(tab.id, {
    type: InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT,
    eventName,
    eventData,
  } satisfies InjectedProviderMessage)
}

type ResponseFn = (response: InjectedProviderMessage) => void

type UseProviderBridgeOptions = {
  provider: Eip1193Provider
  chainId?: ChainId
  account?: `0x${string}`
}

export const useProviderBridge = ({
  provider,
  chainId,
  account,
}: UseProviderBridgeOptions) => {
  useHandleProviderRequests(provider)

  const chainIdRef = useRef<ChainId | null>(null)

  useEffect(() => {
    if (chainId == null) {
      return
    }

    if (chainIdRef.current == null) {
      emitEvent('connect', { chainId: toQuantity(chainId) })
    } else {
      emitEvent('chainChanged', [toQuantity(chainId)])
    }

    chainIdRef.current = chainId
  }, [chainId])

  const accountRef = useRef(account)

  useEffect(() => {
    if (accountRef.current == null && account == null) {
      return
    }

    accountRef.current = account

    emitEvent('accountsChanged', account == null ? [] : [account])
  }, [account])
}

const useHandleProviderRequests = (provider: Eip1193Provider) => {
  const windowId = useWindowId()

  const handleMessage = useCallback(
    (
      message: InjectedProviderMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: ResponseFn
    ) => {
      // only handle messages from our extension
      if (sender.id !== chrome.runtime.id) {
        return
      }

      // only handle messages from the current window
      if (sender.tab?.windowId !== windowId) {
        return
      }

      if (
        message.type !== InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST
      ) {
        return
      }

      provider
        .request(message.request)
        .then((response) => {
          sendResponse({
            type: InjectedProviderMessageTyp.INJECTED_PROVIDER_RESPONSE,
            requestId: message.requestId,
            response,
          })
        })
        .catch((error) => {
          sendResponse({
            type: InjectedProviderMessageTyp.INJECTED_PROVIDER_ERROR,
            requestId: message.requestId,
            error: {
              message: error.message,
              code: error.code,
            },
          })
        })

      // without this the response won't be sent
      return true
    },
    [provider, windowId]
  )

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [handleMessage])
}
