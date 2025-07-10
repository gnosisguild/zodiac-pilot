import { Chain, rpc } from '@zodiac/chains'
import { JsonRpcProvider } from 'ethers'
import type { ChainId } from 'ser-kit'
import { vi, type MockedFunction } from 'vitest'

export class MockJsonRpcProvider extends JsonRpcProvider {
  waitForTranTransaction: MockedFunction<
    InstanceType<typeof JsonRpcProvider>['waitForTransaction']
  > = vi.fn()

  constructor(chainId: ChainId = Chain.ETH) {
    super(rpc(chainId).toString(), chainId)

    this.waitForTransaction = vi.fn()
  }
}
