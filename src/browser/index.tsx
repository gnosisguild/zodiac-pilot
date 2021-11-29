import React, { useState } from 'react'

import { Box } from '../components'

import Address from './Address'
import AddressBar from './AddressBar'
import BrowserFrame from './Frame'
import classNames from './index.module.css'

//const DAO_SAFE = '0x5f4E63608483421764fceEF23F593A5d0D6C9F4D'
const DAO_SAFE = '0x87eb5f76c3785936406fa93654f39b2087fd8068'

const Browser: React.FC = () => {
  const [avatarAddress, setAvatar] = useState(DAO_SAFE)
  const [targetAddress, setTarget] = useState(DAO_SAFE)
  return (
    <div className={classNames.browser}>
      <div className={classNames.topBar}>
        <AddressBar />
        <Address label="Avatar" value={avatarAddress} onChange={setAvatar} />
        <Address
          label="Target Module"
          value={targetAddress}
          onChange={setTarget}
        />
      </div>
      <div className={classNames.main}>
        <Box className={classNames.frame}>
          <BrowserFrame
            key={avatarAddress}
            avatarAddress={avatarAddress}
            targetAddress={targetAddress}
          />
        </Box>
      </div>
    </div>
  )
}

export default Browser
