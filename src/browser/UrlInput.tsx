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
      placeholder="Type a url"
      onKeyPress={(ev) => {
        if (ev.key === 'Enter' && ev.target instanceof HTMLInputElement) {
          if (!ev.target.value.trim()) return
          const url = prependHttp(ev.target.value)
          pushLocation(url)
          onSubmit(url)
        }
      }}
      onFocus={(ev) => {
        ev.target.select()
      }}
    />
  )
}

export default UrlInput

// From: https://github.com/sindresorhus/prepend-http, Copyright (c) Sindre Sorhus
// MIT licensed (https://github.com/sindresorhus/prepend-http/blob/main/license)
export const prependHttp = (url: string) => {
  const trimmed = url.trim()

  if (/^\.*\/|^(?!localhost)\w+?:/.test(trimmed)) {
    return trimmed
  }

  return trimmed.replace(/^(?!(?:\w+?:)?\/\/)/, 'http://')
}
