import {
  Address,
  PrefixedAddress,
  queryInitiators as baseQueryInitiators,
} from 'ser-kit'

type SuccessResult = { error: null; initiators: Address[] }
type ErrorResult = { error: Error; initiators: never[] }

export const queryInitiators = async (
  avatar: PrefixedAddress,
): Promise<SuccessResult | ErrorResult> => {
  try {
    const initiators = await baseQueryInitiators(avatar)

    return { error: null, initiators }
  } catch (error) {
    console.error(error)

    return {
      error: new Error('Could not query initiators', { cause: error }),
      initiators: [],
    }
  }
}
