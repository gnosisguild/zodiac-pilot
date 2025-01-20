import {
  BrowserClient,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope,
} from '@sentry/browser'

// filter integrations that use the global variable
const integrations = getDefaultIntegrations({}).filter((defaultIntegration) => {
  return !['BrowserApiErrors', 'Breadcrumbs', 'GlobalHandlers'].includes(
    defaultIntegration.name,
  )
})

const client = new BrowserClient({
  dsn: 'https://92eff3b9c50f79131ca0cb813f4b9304@o4508675621912576.ingest.us.sentry.io/4508676512677888',
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  integrations: integrations,
})

const scope = new Scope()
scope.setClient(client)

client.init()

export { client }
