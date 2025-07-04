# Railgun Integration Implementation

This PR implements the Railgun integration feature for Zodiac Pilot as specified in issue #1957.

## Overview

The Railgun integration allows Pilot to be used as a pure transaction recording tool that can:
- Impersonate any Ethereum address (not limited to Safe accounts)
- Execute custom RPC calls for blockchain state spoofing
- Submit recorded transaction bundles to a callback URL instead of the zodiac OS submit page

## Implementation Details

### New Route Structure

The implementation adds a new route with the following format:

```
GET /launch/:prefixedAvatarAddress/:accountLabel?setup=<base64_rpc_calls>&callback=<callback_url>
```

**Parameters:**
- `prefixedAvatarAddress`: The avatar address with optional chain prefix (e.g., `eth:0x...` or `0x...`)
- `accountLabel`: Human-readable label for the account
- `setup`: Base64-encoded JSON array of RPC calls for blockchain state setup
- `callback`: URL to POST the bundle data to upon submission

### Key Features

#### 1. Address Impersonation
- Supports any Ethereum address format
- Handles prefixed addresses (e.g., `eth:0x...`, `polygon:0x...`)
- No Safe account requirement

#### 2. Blockchain State Spoofing
- Executes arbitrary RPC calls via the `setup` parameter
- Supports common spoofing methods:
  - `hardhat_setBalance` - Set ETH balance
  - `hardhat_setStorageAt` - Set contract storage
  - `hardhat_impersonateAccount` - Enable account impersonation
  - Custom RPC methods as needed

#### 3. Transaction Recording
- Records all transactions performed while in launch mode
- Maintains transaction history in memory (not persisted)
- Supports standard Ethereum transaction format

#### 4. Bundle Submission
- Posts transaction bundle to specified callback URL
- Includes transaction data, avatar info, and timestamp
- Closes panel/window upon successful submission

## Files Added/Modified

### New Files

1. **`deployables/app/app/routes/launch.tsx`**
   - Main launch route component
   - Handles avatar setup and transaction recording
   - Manages callback URL submission

2. **`deployables/app/app/utils/bundleService.ts`**
   - Bundle data formatting and submission utilities
   - URL validation and address parsing
   - Transaction validation helpers

3. **`deployables/app/app/simulation/railgunProvider.ts`**
   - Enhanced simulation provider for Railgun integration
   - RPC call execution and blockchain state spoofing
   - Avatar setup without Safe-specific logic

### Modified Files

1. **`deployables/app/app/routes.ts`**
   - Added new launch route configuration
   - Route: `/launch/:prefixedAvatarAddress/:accountLabel`

## API Specification

### Launch Endpoint

```typescript
GET /launch/:prefixedAvatarAddress/:accountLabel
```

**Query Parameters:**
- `setup`: Base64-encoded JSON array of RPC calls
- `callback`: URL to POST bundle data to (required)

**Example:**
```
GET /launch/eth:0x742d35Cc6634C0532925a3b8D581C58d43DA9040/MyAccount?setup=W3sibWV0aG9kIjoiaGFyZGhhdF9zZXRCYWxhbmNlIiwicGFyYW1zIjpbIjB4NzQyZDM1Q2M2NjM0QzA1MzI5MjVhM2I4RDU4MUM1OGQ0M0RBOTAzMCIsIjB4MWRjZDY1MDAwMDAwMDAwMCJdfV0=&callback=https://example.com/webhook
```

### Bundle Data Format

The bundle data submitted to the callback URL follows this format:

```typescript
interface BundleData {
  transactions: Transaction[]
  avatar: string
  label: string
  timestamp: number
}

interface Transaction {
  to?: string
  data?: string
  value?: string
  gasLimit?: string
  gasPrice?: string
  [key: string]: any
}
```

**Example Bundle Data:**
```json
{
  "transactions": [
    {
      "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "data": "0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b8d581c58d43da9040000000000000000000000000000000000000000000000000000000000000064",
      "value": "0",
      "timestamp": 1640995200000
    }
  ],
  "avatar": "eth:0x742d35Cc6634C0532925a3b8D581C58d43DA9040",
  "label": "MyAccount",
  "timestamp": 1640995200000
}
```

### Setup RPC Calls Format

The setup parameter should contain a base64-encoded JSON array of RPC calls:

```typescript
interface SetupCall {
  method: string
  params: any[]
}
```

**Example Setup Calls:**
```json
[
  {
    "method": "hardhat_setBalance",
    "params": ["0x742d35Cc6634C0532925a3b8D581C58d43DA9040", "0x1dcd65000000000"]
  },
  {
    "method": "hardhat_setStorageAt",
    "params": ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "0x0", "0x64"]
  }
]
```

## Security Considerations

1. **Callback URL Validation**: Only HTTPS URLs are allowed in production
2. **Address Validation**: All addresses are validated before use
3. **RPC Call Sanitization**: Setup calls are parsed and validated
4. **No Persistence**: Avatar data is temporary and not stored permanently
5. **Rate Limiting**: Consider implementing rate limiting for callback requests

## Usage Example

1. **Launch URL Construction:**
   ```javascript
   const avatarAddress = "eth:0x742d35Cc6634C0532925a3b8D581C58d43DA9040"
   const accountLabel = "MyRailgunAccount"
   const setupCalls = [
     {
       method: "hardhat_setBalance",
       params: [avatarAddress.split(':')[1], "0x1000000000000000000"]
     }
   ]
   const setup = btoa(JSON.stringify(setupCalls))
   const callback = "https://my-app.com/webhook"
   
   const launchUrl = `https://app.pilot.gnosisguild.org/launch/${avatarAddress}/${accountLabel}?setup=${setup}&callback=${callback}`
   ```

2. **Open Pilot in Integration Mode:**
   ```javascript
   window.open(launchUrl, 'pilot', 'width=800,height=600')
   ```

3. **Handle Webhook Response:**
   ```javascript
   // Your webhook endpoint
   app.post('/webhook', (req, res) => {
     const bundleData = req.body
     console.log('Received bundle:', bundleData)
     
     // Process the transactions
     processBundleData(bundleData)
     
     res.status(200).send('OK')
   })
   ```

## Testing

The implementation includes comprehensive validation:
- URL parameter validation
- Address format validation
- RPC call format validation
- Transaction data validation
- Callback URL validation

## Future Enhancements

1. **Enhanced RPC Support**: Add support for more blockchain spoofing methods
2. **Chain Support**: Extend to support multiple blockchain networks
3. **Batch Operations**: Support for batch transaction submissions
4. **Advanced Validation**: More sophisticated transaction validation
5. **State Management**: Optional state persistence for complex scenarios

## Integration Notes

- The launch route operates independently of existing Safe account logic
- Transaction recording is event-driven and memory-based
- The implementation is designed to be stateless and ephemeral
- No database persistence is required for basic functionality

This implementation provides a clean, secure, and efficient way for Railgun to integrate with Pilot for transaction recording and submission.