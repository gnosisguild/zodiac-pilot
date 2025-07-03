# VNet API

This is a simple wrapper around Tenderly's VNet API and RPC endpoints, so we can keep our Tenderly access token private and protect user privacy by proxying RPC requests.

## Features

### VNet Management Proxy
- Proxies requests to create and manage Tenderly virtual networks
- Keeps Tenderly access credentials secure

### RPC Proxy (Privacy Protection)
- Proxies RPC requests to Tenderly virtual network endpoints
- Prevents user IP addresses from being exposed to Tenderly
- Important for privacy in Railgun integration and general user protection

## Configuration

This worker requires three vars to connect to the Tenderly Api:

- `TENDERLY_USER`
  - set in `wrangler.toml`
- `TENDERLY_PROJECT`
  - set in `wrangler.toml`
- `TENDERLY_ACCESS_KEY`
  - this is should be kept secret. We add it to the [Cloudflare worker via api in a Github Action](https://github.com/gnosis/zodiac-pilot/blob/3bfd17dd05e97d18315c142afe9f24e5e46885e2/.github/workflows/api-release.yaml#L31), but you could also add this using the Cloudflare Dashboard.

## Usage

### VNet Management
```
POST https://vnet-api.pilot.gnosisguild.org/
```
Proxies to Tenderly's VNet management API.

### RPC Proxy
```
POST https://vnet-api.pilot.gnosisguild.org/rpc/virtual.mainnet.rpc.tenderly.co/your-vnet-id
```
Proxies RPC requests to the corresponding Tenderly virtual network endpoint. This protects user privacy by ensuring their IP addresses are not exposed to Tenderly.
