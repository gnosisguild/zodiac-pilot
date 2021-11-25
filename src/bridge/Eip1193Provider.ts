import { Interface } from '@ethersproject/abi'
import { Eip1193Bridge } from '@ethersproject/experimental'
import { Provider } from '@ethersproject/providers'
import { Signer } from 'ethers'

interface TxInfo {
  data: string
  from?: string
  to: string
  value: string
  gas?: string
}

const avatarInterface = new Interface([
  'function execTransactionFromModule(address to, uint256 value, bytes memory data, uint8 operation) returns (bool success)',
])

const encode = (tx: TxInfo) =>
  avatarInterface.encodeFunctionData(
    'execTransactionFromModule(address,uint256,bytes,uint8)',
    [tx.to, tx.value, tx.data, 0]
  )

export class Eip1193Provider extends Eip1193Bridge {
  private targetAvatar: string
  async wrapTransaction(tx: TxInfo): Promise<TxInfo> {
    return {
      data: encode(tx),
      from: await this.signer.getAddress(),
      to: this.targetAvatar,
      value: '0x0',
    }
  }

  constructor(provider: Provider, signer: Signer, targetAvatar: string) {
    super(signer, provider)
    this.targetAvatar = targetAvatar
  }

  async send(method: string, params: Array<any> = []): Promise<any> {
    switch (method) {
      case 'eth_requestAccounts': {
        return [this.targetAvatar]
      }
      case 'eth_accounts': {
        return [this.targetAvatar]
      }
      case 'eth_estimateGas': {
        if (params[1] && params[1] !== 'latest') {
          throw new Error('estimateGas does not support blockTag')
        }
        const wrappedTx = await this.wrapTransaction(params[0])
        const result = await this.provider.estimateGas(wrappedTx)
        return result.toHexString()
      }
      case 'eth_sendTransaction': {
        if (!this.signer) {
          return new Error('eth_sendTransaction requires an account')
        }

        const wrappedTx = await this.wrapTransaction(params[0])
        console.log(1, { params, wrappedTx })
        try {
          const tx = await this.signer.sendTransaction({
            ...wrappedTx,
            gasLimit: wrappedTx.gas,
          })
          console.error(2, { params, wrappedTx, txHash: tx.hash, tx })
          return tx.hash
        } catch (e) {
          console.error(e)
        }
        break
      }

      default:
        return super.send(method, params)
    }
  }
}
