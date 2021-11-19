import React from 'react'

import BrowserFrame from './Frame'
import AddressBar from './AddressBar'

const Browser: React.FC<{}> = () => {
  return (
    <div>
      <AddressBar />
      <BrowserFrame />
    </div>
  )
}

export default Browser
