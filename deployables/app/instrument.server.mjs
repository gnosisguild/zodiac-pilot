import * as Sentry from '@sentry/react-router'

Sentry.init({
  dsn: 'https://c39d76bbc73d7a511713c23ef37f1e94@o4508675621912576.ingest.us.sentry.io/4508676926078976',

  // enable capturing entire submit & route urls (Sentry cuts off the URL is tracks by default)
  maxValueLength: 5000,
  beforeSend(event) {
    event.contexts = event.contexts || {}
    event.contexts.custom = event.contexts.custom || {}
    event.contexts.custom.url = event.request?.url
    return event
  },
})
