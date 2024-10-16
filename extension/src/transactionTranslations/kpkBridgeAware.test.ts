import { describe, expect, it } from 'vitest'
import kpkBridgeAware from './kpkBridgeAware';


const ETH_CIRCLE_TOKEN_MESSENGER = '0xBd3fa81B58Ba92a82136038B25aDec7066af3155';
const bridgeAwareContractAddress = '0x1234';
describe('karpatkey bridge aware translations', () => {
    it('should detect bridging of usdc from mainnet using circle_token_bridge', async () => {
        const result = await kpkBridgeAware.translate( {
            to: ETH_CIRCLE_TOKEN_MESSENGER,
            data: '0x6fd3504e00000000000000000000000000000000000000000000000000000005d21dba000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000846e7f810e08f1e2af2c5afd06847cc95f5cae1b000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            value: '0x00'
        });
        expect(result).toEqual([{
            to: ETH_CIRCLE_TOKEN_MESSENGER,
            data: '0x6fd3504e00000000000000000000000000000000000000000000000000000005d21dba000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000846e7f810e08f1e2af2c5afd06847cc95f5cae1b000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            value: '0x00'
        },{
            to: bridgeAwareContractAddress,
            data: '0x56aa9cae000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            value: '0x00'
        }])
    })
})
