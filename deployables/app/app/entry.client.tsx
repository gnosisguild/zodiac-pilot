import * as Sentry from '@sentry/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: 'https://c39d76bbc73d7a511713c23ef37f1e94@o4508675621912576.ingest.us.sentry.io/4508676926078976',
    integrations: [],
    maxValueLength: 5000, // enable capturing entire submit & route urls
  })
}

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>,
)
