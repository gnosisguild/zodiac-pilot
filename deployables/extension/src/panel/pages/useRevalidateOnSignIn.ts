import { CompanionAppMessageType, useTabMessageHandler } from '@zodiac/messages'
import { useRef } from 'react'
import { useRevalidator } from 'react-router'

export const useRevalidateOnSignIn = (initialSignedIn: boolean) => {
  const { revalidate } = useRevalidator()
  const signedInRef = useRef(initialSignedIn)

  useTabMessageHandler(CompanionAppMessageType.PING, ({ signedIn }) => {
    if (signedInRef.current !== signedIn) {
      revalidate()
    }

    signedInRef.current = signedIn
  })
}
