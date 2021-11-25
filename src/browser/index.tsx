import React from 'react'

import AddressBar from './AddressBar'
import BrowserFrame from './Frame'

const Browser: React.FC<{}> = () => {
  return (
    <div>
      <AddressBar />
      <BrowserFrame />
    </div>
  )
}

export default Browser
