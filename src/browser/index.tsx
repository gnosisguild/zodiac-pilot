import React, { useState } from 'react'

import { Box } from '../components'
import { useSafeModuleInfo } from '../hooks/useSafeModuleInfo'

import Address from './Address'
import AddressBar from './AddressBar'
import AddressSelect from './AddressSelect'
import BrowserFrame from './Frame'
import classNames from './index.module.css'

//const DAO_SAFE = '0x5f4E63608483421764fceEF23F593A5d0D6C9F4D'
const DAO_SAFE = '0x87eb5f76c3785936406fa93654f39b2087fd8068'

const Browser: React.FC = () => {
  const [avatarAddress, setAvatar] = useState(DAO_SAFE)
  const [targetAddress, setTarget] = useState('')

  const { loading, isValidSafe, enabledModules } =
    useSafeModuleInfo(avatarAddress)

  return (
    <div className={classNames.browser}>
      <div className={classNames.topBar}>
        <AddressBar />
        <Address
          label="Avatar"
          value={avatarAddress}
          onChange={(value) => {
            setTarget('')
            setAvatar(value)
          }}
        />
        {!loading && isValidSafe && (
          <AddressSelect
            label="Target Module"
            options={[avatarAddress, ...enabledModules]}
            value={targetAddress || avatarAddress}
            onChange={setTarget}
          />
        )}
      </div>
      <div className={classNames.main}>
        <Box className={classNames.frame}>
          {loading && <p>Loading</p>}
          {!loading && !isValidSafe && <p>Invalid Safe Address</p>}
          {!loading && isValidSafe && (
            <BrowserFrame
              key={`${avatarAddress}${targetAddress}`}
              avatarAddress={avatarAddress}
              targetAddress={targetAddress || avatarAddress}
            />
          )}
        </Box>
      </div>
    </div>
  )
}

export default Browser
