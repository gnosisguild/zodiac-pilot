import React, { useEffect, useState } from 'react'
import { updateLocation, useLocation } from './location'

const AddressBar: React.FC<{}> = () => {
  const location = useLocation()
  return (
    <div>
      <input
        type="text"
        defaultValue={location}
        key={location}
        onKeyPress={(ev) => {
          if (ev.key === 'Enter' && ev.target instanceof HTMLInputElement) {
            updateLocation(ev.target.value)
          }
        }}
      />
    </div>
  )
}

export default AddressBar
