import { ConnectedWalletMessage, ConnectedWalletMessageType } from '@/messages'
import { HexAddress } from '@/types'
import { sleep } from '@/utils'
import { Runtime } from 'vitest-chrome/types/vitest-chrome'
import { callListeners } from './callListeners'

type ConnectMockWalletOptions = {
  accounts: HexAddress[]
  chainId: HexAddress
}

export const connectMockWallet = async (
  mockPort: Runtime.Port,
  { accounts, chainId }: ConnectMockWalletOptions
) => {
  await callListeners(
    mockPort.onMessage,
    {
      type: ConnectedWalletMessageType.CONNECTED_WALLET_CONNECTED,
    } satisfies ConnectedWalletMessage,
    mockPort
  )

  await callListeners(
    mockPort.onMessage,
    {
      type: ConnectedWalletMessageType.CONNECTED_WALLET_INITIALIZED,
    } satisfies ConnectedWalletMessage,
    mockPort
  )

  await sleep(1)

  await callListeners(
    mockPort.onMessage,
    {
      type: ConnectedWalletMessageType.CONNECTED_WALLET_EVENT,
      eventName: 'chainChanged',
      eventData: chainId,
    } satisfies ConnectedWalletMessage,
    mockPort
  )

  await callListeners(
    mockPort.onMessage,
    {
      type: ConnectedWalletMessageType.CONNECTED_WALLET_EVENT,
      eventName: 'accountsChanged',
      eventData: accounts,
    } satisfies ConnectedWalletMessage,
    mockPort
  )
}