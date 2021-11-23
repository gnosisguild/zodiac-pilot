import { Web3Provider } from '@ethersproject/providers'
import React from 'react'
import ReactDom from 'react-dom'

import Browser from './browser'

// const handleConnect = async () => {
//   // read-only
//   // let ethersProvider = new ethers.providers.JsonRpcProvider(
//   //   proccess.env.API_ENDPOINT
//   // )
//   const { provider } = await injected.activate()
//   // signer
//   const signer = provider.getSigner()
//   ethersProvider = new Web3Provider(signer)
// }

ReactDom.render(
  <React.StrictMode>
    <Browser />
  </React.StrictMode>,
  document.getElementById('root')
)
