import { useNavigation } from 'react-router'

export const useIsPending = (intent?: string) => {
  const { state, formData } = useNavigation()

  if (state === 'idle') {
    return false
  }

  if (intent != null) {
    if (formData != null && formData.get('intent') === intent) {
      return true
    }

    return false
  }

  return true
}
