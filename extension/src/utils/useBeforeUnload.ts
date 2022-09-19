import { useEffect, useRef } from 'react'

type BeforeUnloadHandler = (event: BeforeUnloadEvent) => string | void

// The MIT License (MIT)

// Copyright (c) 2022 Jacob Buck

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
const useBeforeUnload = (handler: BeforeUnloadHandler) => {
  const eventListenerRef = useRef<BeforeUnloadHandler>()

  useEffect(() => {
    eventListenerRef.current = (event: BeforeUnloadEvent) => {
      const returnValue = handler(event)
      // Handle legacy `event.returnValue` property
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
      if (typeof returnValue === 'string') {
        return (event.returnValue = returnValue)
      }
      // Chrome doesn't support `event.preventDefault()` on `BeforeUnloadEvent`,
      // instead it requires `event.returnValue` to be set
      // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#browser_compatibility
      if (event.defaultPrevented) {
        return (event.returnValue = '')
      }
    }
  }, [handler])

  useEffect(() => {
    const eventListener = (event: BeforeUnloadEvent) =>
      eventListenerRef.current && eventListenerRef.current(event)

    window.addEventListener('beforeunload', eventListener)
    return () => {
      window.removeEventListener('beforeunload', eventListener)
    }
  }, [])
}

export default useBeforeUnload
