import {
  decode,
  metaTransactionRequestSchema,
  type MetaTransactionRequest,
} from '@zodiac/schema'

export const parseTransactionData = (
  transactionData: string,
): MetaTransactionRequest[] => {
  try {
    const rawJson = decode(transactionData)

    return metaTransactionRequestSchema.array().parse(rawJson)
  } catch (error) {
    console.error('Error parsing the route from the URL', { error })

    throw new Response(JSON.stringify(error), { status: 400 })
  }
}
