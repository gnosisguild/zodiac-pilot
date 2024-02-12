import type {
  ErrorResponse,
  GetTxBySafeTxHashParams,
  GetBalanceParams,
  MethodToResponse,
  RequestId,
  SDKMessageEvent,
  RPCPayload,
  SendTransactionsParams,
  SignTypedMessageParams,
  SignMessageParams,
} from '@safe-global/safe-apps-sdk'
import { PermissionRequest } from '@safe-global/safe-apps-sdk/dist/types/types/permissions'
import {
  getSDKVersion,
  Methods,
  MessageFormatter,
} from '@safe-global/safe-apps-sdk'
import {
  getBalances,
  getTransactionDetails,
} from '@safe-global/safe-gateway-typescript-sdk'
import { ChainId, CHAIN_CURRENCY, CHAIN_NAME, CHAIN_PREFIX } from '../chains'
import { Connection, Eip1193Provider } from '../types'
import { reloadIframe, requestIframeHref } from '../location'

type MessageHandler = (
  params: any,
  id: SDKMessageEvent['data']['id'],
  env: SDKMessageEvent['data']['env']
) =>
  | void
  | MethodToResponse[Methods]
  | ErrorResponse
  | Promise<MethodToResponse[Methods] | ErrorResponse | void>

export default class SafeAppBridge {
  private provider: Eip1193Provider
  private connection: Connection
  private connectedOrigin: string | undefined

  constructor(provider: Eip1193Provider, connection: Connection) {
    this.provider = provider
    this.connection = connection
  }

  setProvider = (provider: Eip1193Provider) => {
    this.provider = provider
  }

  setConnection = async (connection: Connection) => {
    const accountOrChainSwitched =
      connection.avatarAddress !== this.connection.avatarAddress ||
      connection.chainId !== this.connection.chainId

    this.connection = connection
    const href = await requestIframeHref()
    const currentOrigin = href ? new URL(href).host : undefined

    const isConnected =
      this.connectedOrigin && currentOrigin === this.connectedOrigin

    if (isConnected && accountOrChainSwitched) {
      // Safe Apps don't expect and won't support switching accounts or chains.
      // So we need to reload the iframe.

      this.connectedOrigin = undefined
      reloadIframe()
    }
  }

  handleMessage = async (msg: MessageEvent): Promise<void> => {
    if (
      !msg.source ||
      msg.source instanceof MessagePort ||
      msg.source instanceof ServiceWorker
    ) {
      // ignore messages from ports and workers
      return
    }

    if (msg.data.method === Methods.getSafeInfo) {
      // If we get here, it means the Safe App is connected
      if (msg.origin !== this.connectedOrigin) {
        console.debug('SAFE_APP_CONNECTED', msg.origin)
        this.connectedOrigin = msg.origin
      }
    }

    const handler = this.handlers[msg.data.method as Methods] as
      | MessageHandler
      | undefined
    if (!handler) return

    console.debug('SAFE_APP_MESSAGE', msg.data)
    try {
      const response = await handler(msg.data.params, msg.data.id, msg.data.env)
      if (typeof response !== 'undefined') {
        this.postResponse(msg.source, response, msg.data.id)
      } else {
        throw new Error('No response returned from handler')
      }
    } catch (e) {
      console.error('Error handling message via SafeAppCommunicator', e)
      this.postResponse(msg.source, getErrorMessage(e), msg.data.id, true)
    }
  }

  postResponse = (
    destination: Window,
    data: unknown,
    requestId: RequestId,
    error = false
  ): void => {
    const sdkVersion = getSDKVersion()
    const msg = error
      ? MessageFormatter.makeErrorResponse(
          requestId,
          data as string,
          sdkVersion
        )
      : MessageFormatter.makeResponse(requestId, data, sdkVersion)

    destination.postMessage(msg, '*')
  }

  handlers: { [method in Methods]: MessageHandler } = {
    [Methods.getTxBySafeTxHash]: ({ safeTxHash }: GetTxBySafeTxHashParams) => {
      return getTransactionDetails(
        CHAIN_PREFIX[this.connection.chainId],
        safeTxHash
      )
    },

    [Methods.getEnvironmentInfo]: () => ({
      origin: document.location.origin,
    }),

    [Methods.getSafeInfo]: () => ({
      safeAddress: this.connection.avatarAddress,
      chainId: this.connection.chainId,
      owners: [],
      threshold: 1,
      isReadOnly: false,
      network:
        LEGACY_CHAIN_NAME[this.connection.chainId] ||
        CHAIN_NAME[this.connection.chainId].toUpperCase(),
    }),

    [Methods.getSafeBalances]: ({ currency = 'usd' }: GetBalanceParams) => {
      return getBalances(
        CHAIN_PREFIX[this.connection.chainId],
        this.connection.avatarAddress,
        currency,
        {
          exclude_spam: true,
          trusted: false, // TODO
        }
      )
    },

    [Methods.rpcCall]: async (params: RPCPayload) => {
      return await this.provider.request({
        method: params.call,
        params: params.params,
      })
    },

    [Methods.sendTransactions]: ({ txs }: SendTransactionsParams) => {
      return Promise.all(
        txs.map((tx) =>
          this.provider.request({ method: 'eth_sendTransaction', params: [tx] })
        )
      )
    },

    [Methods.signMessage]: async ({ message }: SignMessageParams) => {
      // assume on-chain signature
      const safeTxHash = await this.provider.request({
        method: 'eth_sign',
        params: [message],
      })
      return { safeTxHash }
    },

    [Methods.signTypedMessage]: async ({
      typedData,
    }: SignTypedMessageParams) => {
      // assume on-chain signature
      const safeTxHash = await this.provider.request({
        method: 'eth_signTypedData_v4',
        params: [typedData],
      })
      return { safeTxHash }
    },

    [Methods.getChainInfo]: () => {
      const { chainId } = this.connection
      return {
        chainName: CHAIN_NAME[chainId],
        chainId,
        shortName: CHAIN_PREFIX[chainId],
        nativeCurrency: CHAIN_CURRENCY[chainId],
        blockExplorerUriTemplate: {}, // TODO
      }
    },

    [Methods.wallet_getPermissions]: () => {
      return this.provider.request({ method: 'wallet_getPermissions' })
    },

    [Methods.wallet_requestPermissions]: (params: PermissionRequest[]) => {
      return this.provider.request({
        method: 'wallet_requestPermissions',
        params,
      })
    },

    // TODO see how to best implement the following methods
    [Methods.getOffChainSignature]: () => {
      return undefined
    },

    [Methods.requestAddressBook]: () => {
      return undefined
    },
  }
}

const getErrorMessage = (thrown: unknown) => {
  if (thrown instanceof Error) {
    return thrown.message
  }

  if (typeof thrown === 'string') {
    return thrown
  }

  try {
    return JSON.stringify(thrown)
  } catch {
    return String(thrown)
  }
}

const LEGACY_CHAIN_NAME: { [chainId in ChainId]?: string } = {
  1: 'MAINNET',
  100: 'XDAI',
}
