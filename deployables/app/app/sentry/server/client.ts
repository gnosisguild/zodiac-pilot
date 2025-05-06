import {
  defaultStackParser,
  getDefaultIntegrations,
  makeNodeTransport,
  NodeClient,
  Scope,
} from '@sentry/node'

const client = new NodeClient({
  dsn: 'https://c39d76bbc73d7a511713c23ef37f1e94@o4508675621912576.ingest.us.sentry.io/4508676926078976',
  transport: makeNodeTransport,
  stackParser: defaultStackParser,
  integrations: getDefaultIntegrations({}),
  maxValueLength: 5000, // enable capturing entire submit & route urls
})

const scope = new Scope()
scope.setClient(client)

client.init()

export { client }
