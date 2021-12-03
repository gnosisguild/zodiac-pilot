import React from 'react'

import { pushLocation, useLocation } from '../location'

import classes from './index.module.css'

interface Props {
  onSubmit(location: string): void
}

const UrlInput: React.FC<Props> = ({ onSubmit }) => {
  const location = useLocation()
  return (
    <input
      className={classes.urlInput}
      type="text"
      defaultValue={location}
      key={location}
      onKeyPress={(ev) => {
        if (ev.key === 'Enter' && ev.target instanceof HTMLInputElement) {
          pushLocation(ev.target.value)
          onSubmit(ev.target.value)
        }
      }}
    />
  )
}

export default UrlInput
