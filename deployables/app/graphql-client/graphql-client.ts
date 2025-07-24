import { invariant } from '@epic-web/invariant'
import type { AnyVariables, TypedDocumentNode } from '@urql/core'
import { Client, fetchExchange } from '@urql/core'

export const graphqlClient = () => {
  const client = new Client({
    url: 'https://gnosisguild.squids.live/roles:production/api/graphql',
    exchanges: [fetchExchange],
  })

  return {
    async query<Data, Variables extends AnyVariables>(
      query: TypedDocumentNode<Data, Variables>,
      variables: Variables,
    ) {
      const { data } = await client
        .query<Data, Variables>(query, variables)
        .toPromise()

      invariant(data != null, 'Query did not return any data')

      return data
    },
  }
}
