import { useWindowId } from '@/port-handling'
import type { ForkProvider } from '@/providers'
import { getActiveTab, sendMessageToTab } from '@/utils'
import { invariant } from '@epic-web/invariant'
import {
  InjectedProviderMessageTyp,
  useTabMessageHandler,
  type InjectedProviderMessage,
  type InjectedProviderResponse,
  type JsonRpcRequest,
} from '@zodiac/messages'
import type { Hex } from '@zodiac/schema'
import { toQuantity } from 'ethers'
import { useEffect, useRef } from 'react'
import type { ChainId } from 'ser-kit'
import { useProvider } from './ProvideForkProvider'

const emitEvent = async (eventName: string, eventData: any) => {
  const tab = await getActiveTab()

  invariant(tab.id != null, 'Can only send events to tabs that have an ID')

  sendMessageToTab(tab.id, {
    type: InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT,
    eventName,
    eventData,
  } satisfies InjectedProviderMessage)
}

type UseProviderBridgeOptions = {
  chainId?: ChainId
  account?: Hex
}

export const useProviderBridge = ({
  chainId,
  account,
}: UseProviderBridgeOptions = {}) => {
  const provider = useProvider()

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

const useHandleProviderRequests = (provider: ForkProvider) => {
  const currentWindowId = useWindowId()

  useTabMessageHandler(
    InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST,
    ({ request, requestId, injectionId }, { sendResponse, windowId }) => {
      if (currentWindowId !== windowId) {
        return
      }

      provider
        .request(paramsAsArray(request), injectionId)
        .then((response) => {
          sendResponse({
            type: InjectedProviderMessageTyp.INJECTED_PROVIDER_RESPONSE,
            requestId,
            response,
          } satisfies InjectedProviderResponse)
        })
        .catch((error) => {
          sendResponse({
            type: InjectedProviderMessageTyp.INJECTED_PROVIDER_ERROR,
            requestId,
            error: {
              message: error.message,
              code: error.code,
            },
          } satisfies InjectedProviderMessage)
        })

      // without this the response won't be sent
      return true
    },
  )
}

/**
 * Our ForkProvider expects the params to be an array, but the JsonRpcRequest type allows objects.
 */
const paramsAsArray = (request: JsonRpcRequest) => {
  if (!request.params || Array.isArray(request.params)) {
    return request as { method: string; params?: any[] }
  }

  return {
    ...request,
    params: Object.values(request.params),
  }
}
