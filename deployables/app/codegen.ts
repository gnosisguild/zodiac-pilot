import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://gnosisguild.squids.live/roles:production/api/graphql',
  documents: ['app/**/*.graphql'],
  generates: {
    './graphql-client/gql/': {
      preset: 'client',
    },
  },
}
export default config
