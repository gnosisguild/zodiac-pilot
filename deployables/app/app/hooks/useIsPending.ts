import { useNavigation } from 'react-router'

type CheckFn = (data: FormData) => boolean
type IntentOrCheckFn = string | CheckFn

export const useIsPending = (...intentOrCheckFns: IntentOrCheckFn[]) => {
  const { state, formData } = useNavigation()

  if (state === 'idle') {
    return false
  }

  if (intentOrCheckFns.length === 0) {
    return true
  }

  return intentOrCheckFns.every((intentOrCheckFn) => {
    if (formData == null) {
      return false
    }

    if (typeof intentOrCheckFn === 'string') {
      return formData.get('intent') === intentOrCheckFn
    }

    return intentOrCheckFn(formData)
  })
}
