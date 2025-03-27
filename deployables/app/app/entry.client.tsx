import * as Sentry from '@sentry/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://23cb3bbf49ea43ed9bbaf41199c40d1c@o4508675621912576.ingest.us.sentry.io/4508676926078976',
    integrations: [Sentry.browserTracingIntegration()],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/app\.pilot\.gnosisguild\.org/,
    ],
    maxValueLength: 5000, // enable capturing entire submit & route urls
  })
}

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>,
)
