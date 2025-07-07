# VNet API

This is a Cloudflare Worker that provides a wrapper around Tenderly's VNet API, so we never leak our users' IP addresses to third services.

## Features

- **RPC Proxy**: Proxies RPC requests to Tenderly's virtual networks
- **CORS Support**: Handles CORS headers for cross-origin requests
- **Security**: Filters out sensitive headers to prevent data leakage

## API Endpoints

### RPC Proxy

- **URL**: `/rpc/{network}/{slug}`
- **Method**: `POST`
- **Description**: Proxies RPC requests to Tenderly's virtual network endpoints
- **Example**: `/rpc/mainnet/abc123` → `https://virtual.mainnet.rpc.tenderly.co/abc123`
