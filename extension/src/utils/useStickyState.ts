import React, { useEffect, useState } from 'react'

type JsonValue = string | number | boolean | null | JsonValue[] | object

const useStickyState = <T extends JsonValue>(
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
