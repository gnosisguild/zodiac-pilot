import { useNavigation } from 'react-router'

type CheckFn = (data: FormData) => boolean

export const useIsPending = (intentOrCheckFn?: string | CheckFn) => {
  const { state, formData } = useNavigation()

  if (state === 'idle') {
    return false
  }

  if (intentOrCheckFn != null) {
    if (formData == null) {
      return false
    }

    if (typeof intentOrCheckFn === 'string') {
      return formData.get('intent') === intentOrCheckFn
    }

    return intentOrCheckFn(formData)
  }

  return true
}
