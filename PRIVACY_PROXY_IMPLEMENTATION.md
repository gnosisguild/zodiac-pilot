# Tenderly RPC Proxy Implementation for Privacy Protection

## Overview

This PR implements a privacy-protecting proxy for Tenderly RPC requests to prevent user IP addresses from being exposed to Tenderly. This is particularly important for the Railgun integration and general user privacy protection.

## Problem Statement

Previously, while vnet creation and management went through our proxy, the actual RPC calls to Tenderly virtual networks were made directly to URLs like `https://virtual.mainnet.rpc.tenderly.co/...`. This meant user IP addresses were being sent directly to Tenderly, which poses privacy concerns, especially for Railgun users.

## Solution

Extended the existing `vnet-api` Cloudflare Worker to also handle RPC proxying, providing a single privacy-protecting solution for all Tenderly interactions.

## Implementation Details

### 1. Extended vnet-api (`deployables/vnet-api/src/index.ts`)

- **New RPC Proxy Endpoint**: Added `/rpc/` path handler that forwards RPC requests to Tenderly
- **URL Transformation**: Converts proxy URLs like `https://vnet-api.pilot.gnosisguild.org/rpc/virtual.mainnet.rpc.tenderly.co/abc123` back to original Tenderly URLs
- **CORS Support**: Added proper CORS headers and OPTIONS preflight handling for browser requests
- **Error Handling**: Robust error handling with proper status codes and logging

### 2. Updated TenderlyProvider (`deployables/extension/src/panel/providers/fork-provider/TenderlyProvider.tsx`)

- **Proxy Integration**: Modified `createFork()` method to use proxy URLs instead of direct Tenderly URLs
- **URL Transformation**: Added `proxyTenderlyUrl()` helper method to convert Tenderly URLs to proxy URLs
- **Backward Compatibility**: Maintains all existing functionality while adding privacy protection

### 3. Updated Documentation (`deployables/vnet-api/README.md`)

- **Usage Examples**: Added documentation for both vnet management and RPC proxy endpoints
- **Privacy Benefits**: Clearly documented the privacy protection features
- **API Reference**: Comprehensive API documentation for developers

## Technical Flow

1. **Vnet Creation**: TenderlyProvider creates virtual network through existing proxy
2. **RPC URL Transformation**: Admin RPC URL gets transformed from direct Tenderly URL to proxy URL
3. **RPC Requests**: All JSON-RPC requests now go through our proxy instead of directly to Tenderly
4. **Privacy Protection**: User IP addresses are hidden from Tenderly, only our proxy server IP is visible

## Example URL Transformation

**Before (Direct):**
```
https://virtual.mainnet.rpc.tenderly.co/abc123-def456
```

**After (Proxied):**
```
https://vnet-api.pilot.gnosisguild.org/rpc/virtual.mainnet.rpc.tenderly.co/abc123-def456
```

## Privacy Benefits

- **IP Address Protection**: User IP addresses are never exposed to Tenderly
- **Request Anonymization**: All requests appear to come from our proxy server
- **Railgun Compatibility**: Enhanced privacy for Railgun integration
- **General Privacy**: Improved privacy for all Pilot users

## Backward Compatibility

- ✅ All existing functionality preserved
- ✅ No breaking changes to public APIs
- ✅ Existing vnet management continues to work unchanged
- ✅ Transaction links and explorer functionality maintained

## Security Considerations

- **Access Control**: Ready for future access control implementation
- **Rate Limiting**: Inherits Cloudflare's DDoS protection and rate limiting
- **CORS Security**: Properly configured CORS headers restrict cross-origin access
- **Error Handling**: Secure error handling prevents information disclosure

## Testing

- ✅ TypeScript compilation passes
- ✅ ESLint checks pass for all modified files
- ✅ URL transformation logic verified
- ✅ CORS preflight handling implemented

## Future Enhancements

This implementation provides a foundation for future improvements:

- **Access Control**: Can easily add authentication/authorization
- **Analytics**: Can add privacy-preserving usage analytics
- **Rate Limiting**: Can implement per-user rate limiting
- **Monitoring**: Can add comprehensive request monitoring

## Files Modified

1. `deployables/vnet-api/src/index.ts` - Extended proxy functionality
2. `deployables/extension/src/panel/providers/fork-provider/TenderlyProvider.tsx` - Updated to use proxy
3. `deployables/vnet-api/README.md` - Updated documentation

## Deployment

The changes are ready for deployment:

1. **vnet-api**: Can be deployed immediately via existing Cloudflare Workers deployment
2. **Extension**: Will use the new proxy automatically once deployed
3. **No Configuration Changes**: Uses existing environment variables and configuration

This implementation successfully addresses the privacy concerns raised for the Railgun integration while maintaining full backward compatibility and setting up infrastructure for future access control features.