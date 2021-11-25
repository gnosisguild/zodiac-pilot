import { Interface } from '@ethersproject/abi'
import { Eip1193Bridge } from '@ethersproject/experimental'
import { Provider } from '@ethersproject/providers'
import { BigNumber, ethers, Signer } from 'ethers'

const DAO_SAFE = '0x87eb5F76C3785936406fa93654F39b2087FD8068'

interface TxInfo {
  data: string
  from?: string
  to: string
  value: string
  gas?: string
}

const avatarInterface = new Interface([
  'function enableModule(address module) external',
  'function execTransactionFromModule(address to, uint256 value, bytes memory data, uint8 operation) external returns (bool success)',
])

console.log(avatarInterface.format('json'))

const encode = (tx: TxInfo) =>
  avatarInterface.encodeFunctionData(
    'execTransactionFromModule(address,uint256,bytes,uint8)',
    [tx.to, tx.value, tx.data, 0]
  )

export class Eip1193Provider extends Eip1193Bridge {
  async wrapTransaction(tx: TxInfo): Promise<TxInfo> {
    return {
      data: encode(tx),
      from: await this.signer.getAddress(), // ?
      to: DAO_SAFE,
      value: '0x0',
    }
  }

  constructor(signer: Signer, provider?: Provider) {
    super(signer, provider)
  }

  async send(method: string, params: Array<any> = []): Promise<any> {
    switch (method) {
      case 'eth_requestAccounts': {
        // const account = await this.signer.getAddress()
        return [DAO_SAFE]
      }
      case 'eth_accounts': {
        return [DAO_SAFE]
      }
      case 'eth_estimateGas': {
        // if (params[1] && params[1] !== 'latest') {
        //   throw new Error('estimateGas does not support blockTag')
        // }

        // console.log('Log current signer ', await this.signer.getAddress())

        // const wrappedTx = await this.wrapTransaction(params[0])

        // console.log('LOGestimateGas', {
        //   params,
        //   wrappedTx,
        // })
        // const req =
        //   ethers.providers.JsonRpcProvider.hexlifyTransaction(wrappedTx)
        // const result = await this.provider.estimateGas(wrappedTx)
        // return result.toHexString()
        return BigNumber.from(10e12).toHexString()
      }
      case 'eth_sendTransaction': {
        // if (!this.signer) {
        //   return throwUnsupported('eth_sendTransaction requires an account')
        // }

        const wrappedTx = await this.wrapTransaction(params[0])
        // const req = ethers.providers.JsonRpcProvider.hexlifyTransaction(
        //   params[0]
        // )
        console.log({ params, wrappedTx })
        const tx = await this.signer.sendTransaction({
          ...wrappedTx,
          gasLimit: wrappedTx.gas,
        })
        return tx.hash
      }

      default:
        return super.send(method, params)
    }
  }
}
