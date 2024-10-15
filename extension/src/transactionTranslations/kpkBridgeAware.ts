import { KnownContracts } from '@gnosis.pm/zodiac'

import { TransactionTranslation } from './types'
import { FunctionFragment, Interface } from 'ethers'

const ETH_CIRCLE_TOKEN_MESSENGER = '0xBd3fa81B58Ba92a82136038B25aDec7066af3155';
const ETH_CIRCLE_TOKEN_MESSENGER_INTERFACE: Interface = new Interface([
    'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken)'
]);

const BridgeAwareInterface: Interface = new Interface([
    `function bridgeStart(address asset)`
])

export default {
    title: 'Unfold individual calls',

    recommendedFor: [KnownContracts.ROLES_V1, KnownContracts.ROLES_V2],

    translate: async (transaction) => {
        const { to, data  } = transaction

        if (!data || to.toLowerCase() !== ETH_CIRCLE_TOKEN_MESSENGER.toLowerCase()) {
            return undefined
        }
        const bridgeAwareContractAddress = '0x1234';
        let burnToken: string = '';
        try {
            burnToken = ETH_CIRCLE_TOKEN_MESSENGER_INTERFACE.decodeFunctionData(
                ETH_CIRCLE_TOKEN_MESSENGER_INTERFACE.getFunction('depositForBurn') as FunctionFragment,
                data
            ).burnToken;
        }
        catch (e) {
            console.log(e)
        }

        if (!burnToken) {
            return undefined
        }

        return [transaction, {
            to: bridgeAwareContractAddress,
            data: BridgeAwareInterface.encodeFunctionData('bridgeStart', [
                burnToken
            ]),
            value: '0x00'
        } ];
    },
} satisfies TransactionTranslation
