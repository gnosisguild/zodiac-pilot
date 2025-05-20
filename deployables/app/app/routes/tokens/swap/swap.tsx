import { TradeType, type CowSwapWidgetParams } from '@cowprotocol/widget-lib'
import { CowSwapWidget } from '@cowprotocol/widget-react'
import { useIsDark } from '@zodiac/ui'

//  Fill this form https://cowprotocol.typeform.com/to/rONXaxHV once you pick your "appCode"
const params: CowSwapWidgetParams = {
  appCode: 'Zodiac Pilot',
  width: '100%', // Width in pixels (or 100% to use all available space)
  height: '640px',
  chainId: 1,
  tokenLists: [
    // All default enabled token lists. Also see https://tokenlists.org
    'https://files.cow.fi/tokens/CoinGecko.json',
    'https://files.cow.fi/tokens/CowSwap.json',
  ],
  tradeType: TradeType.SWAP, // TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED
  sell: {
    // Sell token. Optionally add amount for sell orders
    asset: '',
    amount: '0',
  },
  buy: {
    // Buy token. Optionally add amount for buy orders
    asset: '',
    amount: '0',
  },
  enabledTradeTypes: [
    TradeType.SWAP,
    TradeType.LIMIT,
    TradeType.ADVANCED,
    TradeType.YIELD,
  ],
  standaloneMode: false,
  disableToastMessages: false,
  disableProgressBar: false,
  hideBridgeInfo: false,
  hideOrdersTable: false,
  images: {},
  sounds: {},
  customTokens: [],
}

function Swap() {
  const isDark = useIsDark()

  if (typeof document === 'undefined') {
    return null
  }

  return (
    <CowSwapWidget
      params={{
        ...params,
        theme: isDark ? 'dark' : 'light',
        partnerFee: {
          bps: 25, // TODO set to zero for Enterprise accounts
          recipient: '0x3ec84da3A9bCed9767490c198E69Aa216A35Df12', // zodiac-os multi-chain Safe
        },
      }}
      provider={window.ethereum}
    />
  )
}

export default Swap
