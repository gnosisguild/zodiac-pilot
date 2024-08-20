import React, { useEffect, useState } from 'react'

import { AppPicker, Box } from '../components'
import ConnectionBubble from '../components/ConnectionBubble'
import Layout from '../components/Layout'
import { pushLocation } from '../location'
import { usePushConnectionsRoute, useUrl } from '../routing'

import Drawer from './Drawer'
import BrowserFrame from './Frame'
import UrlInput from './UrlInput'
import classNames from './index.module.css'
import classes from './index.module.css'

// This disables elastic scroll behavior on Macs
const useNoPageScroll = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])
}

const Browser: React.FC = () => {

  return (
     <Drawer />
  )
}

export default Browser
