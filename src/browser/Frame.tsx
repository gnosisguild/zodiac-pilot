import React, { useEffect } from 'react'

// import BridgeHost from '../bridge/host'

import { useLocation } from './location'

interface Props {}

const BrowserFrame: React.FC<Props> = () => {
  const location = useLocation()

  // useEffect(() => {
  //   new BridgeHost()

  //   return () => {
  //     window.removeEventListener('message', handleMessage)
  //   }
  // }, [])

  return (
    <>
      <iframe
        name="transaction-simulator"
        src={location}
        style={{ display: 'block', width: '100%', height: 900 }}
      />
    </>
  )
}

export default BrowserFrame
