import { utils } from 'ethers'

if (!process.env.SEED_PHRASE) {
  throw new Error('SEED_PHRASE env variable is not set')
}

export const account = utils.HDNode.fromMnemonic(
  process.env.SEED_PHRASE
).address

if (account !== '0x0c531fEc79FdB6F9a4BD2843bfd25ee49F33172d') {
  console.warn(
    `The test Safe and module setup that some tests rely on is using the MetaMask account 0x0c531fEc79FdB6F9a4BD2843bfd25ee49F33172d. Your seed phrase is different: ${account}`
  )
}
