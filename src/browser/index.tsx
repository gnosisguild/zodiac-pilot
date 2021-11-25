import React, { useState } from 'react'

import AddressBar from './AddressBar'
import BrowserFrame from './Frame'
import Target from './Target'

//const DAO_SAFE = '0x5f4E63608483421764fceEF23F593A5d0D6C9F4D'
const DAO_SAFE = '0x87eb5f76c3785936406fa93654f39b2087fd8068'

const Browser: React.FC = () => {
  const [target, setTarget] = useState(DAO_SAFE)
  return <Inner key={target} target={target} onTargetChange={setTarget} />
}

type Props = {
  target: string
  onTargetChange(target: string): void
}

const Inner: React.FC<Props> = ({ target, onTargetChange }) => {
  return (
    <div>
      <div>
        <AddressBar />
        <Target value={target} onChange={onTargetChange} />
      </div>
      <BrowserFrame targetAvatar={target} />
    </div>
  )
}

export default Browser
