import React, { useCallback, useEffect, useRef, useState } from 'react'

import { AppSearch } from '../components'
import { pushLocation, useLocation } from '../location'

import classes from './index.module.css'

interface Props {
  onSubmit(location: string): void
}

const useOnBlur = (callback: () => void) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (ref.current === null) return

    const handleBlur = (event: FocusEvent) => {
      if (
        ref.current?.contains(event.target as Node) &&
        !ref.current?.contains(event.relatedTarget as Node)
      ) {
        callback()
      }
    }
    document.addEventListener('focusout', handleBlur)

    return () => {
      document.removeEventListener('focusout', handleBlur)
    }
  }, [callback])

  return ref
}

const UrlInput: React.FC<Props> = ({ onSubmit }) => {
  const location = useLocation()
  const [hasFocus, setHasFocus] = useState(false)
  const onBlur = useCallback(() => setHasFocus(false), [])
  const ref = useOnBlur(onBlur)

  return (
    <div className={classes.urlInput} ref={ref}>
      <input
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
          setHasFocus(true)
          ev.target.select()
        }}
      />

      {hasFocus && (
        <div className={classes.appPickerDropdown}>
          <AppSearch
            onPick={(url) => {
              pushLocation(url)
              onSubmit(url)
              setHasFocus(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default UrlInput

// From: https://github.com/sindresorhus/prepend-http, Copyright (c) Sindre Sorhus
// MIT licensed (https://github.com/sindresorhus/prepend-http/blob/main/license)
export const prependHttp = (url: string) => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (/^\.*\/|^(?!localhost)\w+?:/.test(trimmed)) {
    return trimmed
  }

  return trimmed.replace(/^(?!(?:\w+?:)?\/\/)/, 'http://')
}
