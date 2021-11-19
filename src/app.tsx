import React from 'react'
import ReactDom from 'react-dom'

import Browser from './browser'

ReactDom.render(
  <React.StrictMode>
    <h1>Hello world!</h1>
    <Browser />
  </React.StrictMode>,
  document.getElementById('root')
)
