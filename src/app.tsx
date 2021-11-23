import React from 'react'
import ReactDom from 'react-dom'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import Browser from './browser'

function getLibrary(provider, connector) {
  return new Web3Provider(provider) // this will vary according to whether you use e.g. ethers or web3.js
}

ReactDom.render(
  <React.StrictMode>
    <Web3ReactProvider>
      <button>Connect with MetaMask</button>
      <Browser />
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
