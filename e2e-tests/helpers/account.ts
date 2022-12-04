import { Wallet } from 'ethers'

if (!process.env.SEED_PHRASE) {
  throw new Error('SEED_PHRASE env variable is not set')
}

export const account = Wallet.fromMnemonic(process.env.SEED_PHRASE).address // 0xB07520a4494793461Cf8762246B7D8695548C22B

if (account !== '0xB07520a4494793461Cf8762246B7D8695548C22B') {
  console.warn(
    `The test Safe and module setup that some tests rely on is using the MetaMask account 0xB07520a4494793461Cf8762246B7D8695548C22B. Your seed phrase is different: ${account}`
  )
}
