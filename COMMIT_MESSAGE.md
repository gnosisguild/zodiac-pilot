# feat: Add Railgun integration for transaction recording

Implements issue #1957 - Railgun integration feature

## Key Changes

- Add new `/launch/:prefixedAvatarAddress/:accountLabel` route
- Support for impersonating any address (not limited to Safe accounts)
- Custom RPC calls for blockchain state spoofing via `setup` parameter
- Submit recorded transactions to callback URL instead of zodiac OS redirect
- No persistence of temporary avatar data

## New Route API

```
GET /launch/:prefixedAvatarAddress/:accountLabel?setup=<base64_rpc_calls>&callback=<callback_url>
```

The route accepts:
- `prefixedAvatarAddress`: Address with optional chain prefix (e.g., `eth:0x...`)
- `accountLabel`: Human-readable account label  
- `setup`: Base64-encoded JSON array of RPC calls for state spoofing
- `callback`: URL to POST bundle data to (required)

## Implementation Details

- **Address Impersonation**: Works with any Ethereum address format
- **State Spoofing**: Supports `hardhat_setBalance`, `hardhat_setStorageAt`, etc.
- **Transaction Recording**: Memory-based recording without persistence
- **Bundle Submission**: Posts transaction data to callback URL and closes panel

## Security Features

- Callback URL validation (HTTPS required in production)
- Address format validation
- RPC call sanitization
- Temporary-only avatar setup

## Files Added

- `deployables/app/app/routes/launch.tsx` - Main launch route component
- `deployables/app/app/utils/bundleService.ts` - Bundle utilities
- `deployables/app/app/simulation/railgunProvider.ts` - Enhanced simulation provider

## Files Modified  

- `deployables/app/app/routes.ts` - Added launch route configuration

Resolves #1957
