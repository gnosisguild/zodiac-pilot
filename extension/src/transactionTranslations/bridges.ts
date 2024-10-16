import { Interface } from 'ethers'

export type BridgeData = {
    address: string;
    interface: Interface;
    tokenArgument?: number;
    token?: string;
}
export const ETH_GNO_XDAI_BRIDGE: BridgeData = {
    address: '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016',
    interface: new Interface([
        'function relayTokens(address _receiver, uint256 _amount)'
    ]),
    token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
};

export const ETH_HOP_DAI_BRIDGE: BridgeData = {
    address: '0x3d4Cc8A61c7528Fd86C55cfe061a78dCBA48EDd1',
    interface: new Interface([
        'function sendToL2(uint256 chainId, address recipient, uint256 amount, uint256 amountOutMin, uint256 deadline, address relayer, uint256 relayerFee)'
    ]),
    token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
};

export const ETH_CONNEXT_BRIDGE: BridgeData = {
    address: '0x8898B472C54c31894e3B9bb83cEA802a5d0e63C6',
    interface: new Interface([
        'function xcall(uint32 _destination, address _to, address _asset, address _delegate, uint256 _amount, uint256 _slippage, bytes _callData, uint256 _relayerFee)'
    ]),
    tokenArgument: 2,
};

export const ETH_GNO_OMNIBRIDGE: BridgeData = {
    address: '0x88ad09518695c6c3712AC10a214bE5109a655671',
    interface: new Interface([
        'function relayTokensAndCall(address token, address _receiver, uint256 _value, bytes _data)'
    ]),
    tokenArgument: 0,
};

export const ETH_OPT_DAI_BRIDGE: BridgeData = {
    address: '0x10E6593CDda8c58a1d0f14C5164B376352a55f2F',
    interface: new Interface([
        'function depositERC20(address _l1Token, address _l2Token, uint256 _amount, uint32 _l2Gas, bytes _data)',
        'function depositERC20To(address _l1Token, address _l2Token, address _to, uint256 _amount, uint32 _l2Gas, bytes _data)'
    ]),
    tokenArgument: 0,
};

export const ETH_OPT_GATEWAY: BridgeData = {
    address: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
    interface: new Interface([
        'function depositERC20(address _l1Token, address _l2Token, uint256 _amount, uint32 _minGasLimit, bytes _extraData)',
        'function depositERC20To(address _l1Token, address _l2Token, address _to, uint256 _amount, uint32 _minGasLimit, bytes _extraData)'
    ]),
    tokenArgument: 0,
};

export const ETH_CIRCLE_TOKEN_MESSENGER: BridgeData = {
    address: '0xBd3fa81B58Ba92a82136038B25aDec7066af3155',
    interface: new Interface([
        'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken)'
    ]),
    tokenArgument: 3,
};

export const ETH_L1_HOP_CCTP: BridgeData = {
    address: '0x7e77461CA2a9d82d26FD5e0Da2243BF72eA45747',
    interface: new Interface([
        'function send(uint256 chainId, address recipient, uint256 amount, uint256 bonderFee)'
    ]),
    token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
};

export const ETH_ARB_DAI_GATEWAY: BridgeData = {
    address: '0xD3B5b60020504bc3489D6949d545893982BA3011',
    interface: new Interface([
        'function outboundTransfer(address l1Token, address to, uint256 amount, uint256 maxGas, uint256 gasPriceBid, bytes data)'
    ]),
    tokenArgument: 0,
};

export const ETH_ARB_ERC20_GATEWAY: BridgeData = {
    address: '0xa3A7B6F88361F48403514059F1F16C8E78d60EeC',
    interface: new Interface([
        'function outboundTransfer(address _l1Token, address _to, uint256 _amount, uint256 _maxGas, uint256 _gasPriceBid, bytes _data)'
    ]),
    tokenArgument: 0,
};

export const ARB1_GATEWAY_ROUTER: BridgeData = {
    address: '0x5288c571Fd7aD117beA99bF60FE0846C4E84F933',
    interface: new Interface([
        'function outboundTransfer(address _l1Token, address _to, uint256 _amount, bytes _data)'
    ]),
    token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
};

export const ARB1_HOP_DAI_WRAPPER: BridgeData = {
    address: '0xe7F40BF16AB09f4a6906Ac2CAA4094aD2dA48Cc2',
    interface: new Interface([
        'function swapAndSend(uint256 chainId, address recipient, uint256 amount, uint256 bonderFee, uint256 amountOutMin, uint256 deadline, uint256 destinationAmountOutMin, uint256 destinationDeadline)'
    ]),
    token: 'null',
};

export const ARB1_CONNEXT_BRIDGE: BridgeData = {
    address: '0xEE9deC2712cCE65174B561151701Bf54b99C24C8',
    interface: new Interface([
        'function xcall(uint32 _destination, address _to, address _asset, address _delegate, uint256 _amount, uint256 _slippage, bytes _callData, uint256 _relayerFee)'
    ]),
    token: 'null',
};

export const ARB1_CIRCLE_TOKEN_MESSENGER: BridgeData = {
    address: '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
    interface: new Interface([
        'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken)'
    ]),
    token: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
};

export const ARB1_L2_HOP_CCTP: BridgeData = {
    address: '0x6504BFcaB789c35325cA4329f1f41FaC340bf982',
    interface: new Interface([
        'function send(uint256 chainId, address recipient, uint256 amount, uint256 bonderFee)'
    ]),
    token: 'null',
};

export const BASE_CIRCLE_TOKEN_MESSENGER: BridgeData = {
    address: '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
    interface: new Interface([
        'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken)'
    ]),
    token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
};

export const BASE_L2_HOP_CCTP: BridgeData = {
    address: '0xe7F40BF16AB09f4a6906Ac2CAA4094aD2dA48Cc2',
    interface: new Interface([
        'function send(uint256 chainId, address recipient, uint256 amount, uint256 bonderFee)'
    ]),
    token: 'null',
};

export const BASE_CONNEXT_BRIDGE: BridgeData = {
    address: '0xB8448C6f7f7887D36DcA487370778e419e9ebE3F',
    interface: new Interface([
        'function xcall(uint32 _destination, address _to, address _asset, address _delegate, uint256 _amount, uint256 _slippage, bytes _callData, uint256 _relayerFee)'
    ]),
    token: 'null',
};

export const GNOSIS_XDAI_BRIDGE_2: BridgeData = {
    address: '0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6',
    interface: new Interface([
        'function relayTokens(address _receiver)'
    ]),
    token: 'null',
};

export const GNOSIS_HOP_DAI_WRAPPER: BridgeData = {
    address: '0x6C928f435d1F3329bABb42d69CCF043e3900EcF1',
    interface: new Interface([
        'function swapAndSend(uint256 chainId, address recipient, uint256 amount, uint256 bonderFee, uint256 amountOutMin, uint256 deadline, uint256 destinationAmountOutMin, uint256 destinationDeadline)'
    ]),
    token: 'null',
};

export const GNOSIS_CONNEXT_BRIDGE: BridgeData = {
    address: '0x5bb83e95f63217cda6ae3d181ba580ef377d2109',
    interface: new Interface([
        'function xcall(uint32 _destination, address _to, address _asset, address _delegate, uint256 _amount, uint256 _slippage, bytes _callData, uint256 _relayerFee)'
    ]),
    token: 'null',
};

export const GNOSIS_USDC: BridgeData = {
    address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
    interface: new Interface([
        'function transferAndCall(address _to, uint256 _value, bytes _data)'
    ]),
    token: 'null',
};

export const OPTIMISM_DAI_TOKEN_BRIDGE: BridgeData = {
    address: '0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65',
    interface: new Interface([
        'function withdraw(address _l2Token, uint256 _amount, uint32 _l1Gas, bytes _data)',
        'function withdrawTo(address _l2Token, address _to, uint256 _amount, uint32 _l1Gas, bytes _data)'
    ]),
    token: 'null',
};

export const OPTIMISM_HOP_DAI_WRAPPER: BridgeData = {
    address: '0xb3C68a491608952Cb1257FC9909a537a0173b63B',
    interface: new Interface([
        'function swapAndSend(uint256 chainId, address recipient, uint256 amount, uint256 bonderFee, uint256 amountOutMin, uint256 deadline, uint256 destinationAmountOutMin, uint256 destinationDeadline)'
    ]),
    token: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
};

export const OPTIMISM_CONNEXT_BRIDGE: BridgeData = {
    address: '0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA',
    interface: new Interface([
        'function xcall(uint32 _destination, address _to, address _asset, address _delegate, uint256 _amount, uint256 _slippage, bytes _callData, uint256 _relayerFee)'
    ]),
    token: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
};

export const OPTIMISM_OPTIMISM_BRIDGE: BridgeData = {
    address: '0x4200000000000000000000000000000000000010',
    interface: new Interface([
        'function withdraw(address _l2Token, uint256 _amount, uint32 _minGasLimit, bytes _extraData)',
        'function withdrawTo(address _l2Token, address _to, uint256 _amount, uint32 _minGasLimit, bytes _extraData)'
    ]),
    token: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
};

export const OPTIMISM_CIRCLE_TOKEN_MESSENGER: BridgeData = {
    address: '0x2B4069517957735bE00ceE0fadAE88a26365528f',
    interface: new Interface([
        'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken)'
    ]),
    token: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
};

export const OPTIMISM_L2_HOP_CCTP: BridgeData = {
    address: '0x469147af8Bde580232BE9DC84Bb4EC84d348De24',
    interface: new Interface([
        'function send(uint256 chainId, address recipient, uint256 amount, uint256 bonderFee)'
    ]),
    token: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
};
