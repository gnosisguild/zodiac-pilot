import React, { useEffect, useState } from 'react'

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

const useStickyState = <T extends JSONValue>(
  initialValue: T,
  storageKey: string
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState(() => {
    const stringValue = localStorage.getItem(storageKey)
    return stringValue !== null ? JSON.parse(stringValue) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value))
  }, [storageKey, value])

  return [value, setValue]
}

export default useStickyState
