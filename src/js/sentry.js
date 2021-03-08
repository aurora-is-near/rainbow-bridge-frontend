import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'

Sentry.init({
  dsn: 'https://aa1b5a908e7e438c97400adeac4768bd@o398573.ingest.sentry.io/5644743',
  integrations: [new Integrations.BrowserTracing({
    tracingOrigins: ["*.infura.io", "*.near.org", "localhost"]
  })],
  tracesSampleRate: 1.0
})
