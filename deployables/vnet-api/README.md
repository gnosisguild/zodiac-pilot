# VNet API

This is a simple wrapper around Tenderly's VNet API, so we can keep our Tenderly access token private.

## Env Vars

This worker requires three vars to connect to the Tenderly Api:

- `TENDERLY_USER`
  - set in `wrangler.toml`
- `TENDERLY_PROJECT`
  - set in `wrangler.toml`
- `TENDERLY_ACCESS_KEY`
  - this is should be kept secret. We add it to the [Cloudflare worker via api in a Github Action](https://github.com/gnosis/zodiac-pilot/blob/3bfd17dd05e97d18315c142afe9f24e5e46885e2/.github/workflows/api-release.yaml#L31), but you could also add this using the Cloudflare Dashboard.
