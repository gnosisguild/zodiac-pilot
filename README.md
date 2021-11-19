# Transaction Simulator

Chrome extension to simulate dApp interactions and record transactions.

## Contribute

#### Build for production

```
yarn build
```

#### Watch for development

```
yarn dev
```

## How it works

### Open dApps in iframe

For allowing arbitrary pages to be loaded in our iframe we drop `X-Frame-Options` and `Content-Security-Policy` HTTP response headers for any requests originating from the extension domain. See: [public/removeHeaders.json].

The `domains` list in the filter only includes this extension's ID.
This is crucial as must lift the cross origin restrictions only for the extension but not generally.

### Intercept and and re-route RPC calls to service worker
