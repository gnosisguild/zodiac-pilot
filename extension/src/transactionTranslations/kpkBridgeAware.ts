import { KnownContracts } from '@gnosis.pm/zodiac'

import { TransactionTranslation } from './types'
import { FunctionFragment, Interface } from 'ethers'
import {
    BridgeData,
    ETH_ARB_DAI_GATEWAY,
    ETH_ARB_ERC20_GATEWAY,
    ETH_CIRCLE_TOKEN_MESSENGER,
    ETH_CONNEXT_BRIDGE,
    ETH_GNO_OMNIBRIDGE,
    ETH_GNO_XDAI_BRIDGE,
    ETH_HOP_DAI_BRIDGE,
    ETH_L1_HOP_CCTP,
    ETH_OPT_DAI_BRIDGE,
    ETH_OPT_GATEWAY
} from './bridges';

//Abstracting for mainnet
const mainNetBridges: BridgeData[] = [
    ETH_GNO_XDAI_BRIDGE,
    ETH_HOP_DAI_BRIDGE,
    ETH_CONNEXT_BRIDGE,
    ETH_GNO_OMNIBRIDGE,
    ETH_OPT_DAI_BRIDGE,
    ETH_OPT_GATEWAY,
    ETH_CIRCLE_TOKEN_MESSENGER,
    ETH_L1_HOP_CCTP,
    ETH_ARB_DAI_GATEWAY,
    ETH_ARB_ERC20_GATEWAY
]
const BridgeAwareInterface: Interface = new Interface([
    `function bridgeStart(address asset)`
])

export default {
    title: 'Unfold individual calls',

    recommendedFor: [KnownContracts.ROLES_V1, KnownContracts.ROLES_V2],

    translate: async (transaction) => {
        const { to, data } = transaction;

        const selectedBridge = mainNetBridges.find(bridge =>
            to.toLowerCase() === bridge.address.toLowerCase()
        );

        if (!data || !selectedBridge){
            return;
        }

        const bridgeAwareContractAddress = '0x1234';

        let burnToken = '';

        try {
            const decodedData = selectedBridge.interface.decodeFunctionData(
                selectedBridge.interface.fragments[0] as FunctionFragment,
                data
            );
            burnToken = (selectedBridge.tokenArgument !== undefined)
                ? decodedData[selectedBridge.tokenArgument]
                : selectedBridge.token;
        } catch (e) {
            console.log(e);
            return;
        }

        if (!burnToken) {
            return;
        }

        return [transaction, {
            to: bridgeAwareContractAddress,
            data: BridgeAwareInterface.encodeFunctionData('bridgeStart', [burnToken]),
            value: '0x00'
        }];
    },
} satisfies TransactionTranslation
