import React from 'react'
import { useLocation } from './location'

interface Props {}

const BrowserFrame: React.FC<Props> = () => {
  const location = useLocation()
  console.log({ location })
  return <iframe src={location} style={{ display: 'block' }}></iframe>
}

export default BrowserFrame
