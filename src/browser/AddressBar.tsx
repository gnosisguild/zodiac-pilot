import React from 'react'

import { updateLocation, useLocation } from './location'

const AddressBar: React.FC = () => {
  const location = useLocation()
  return (
    <>
      <label htmlFor="dapp-url">Url </label>
      <input
        id="dapp-url"
        type="text"
        defaultValue={location}
        key={location}
        onKeyPress={(ev) => {
          if (ev.key === 'Enter' && ev.target instanceof HTMLInputElement) {
            updateLocation(ev.target.value)
          }
        }}
      />
    </>
  )
}

export default AddressBar
