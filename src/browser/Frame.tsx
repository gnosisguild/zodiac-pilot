import React from 'react'
import { useLocation } from './location'

interface Props {}

const BrowserFrame: React.FC<Props> = () => {
  const location = useLocation()
  return (
    <iframe
      name="transaction-simulator"
      src={location}
      style={{ display: 'block', width: '100%', height: 900 }}
    ></iframe>
  )
}

export default BrowserFrame
