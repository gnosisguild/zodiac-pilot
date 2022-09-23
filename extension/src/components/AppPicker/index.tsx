import cn from 'classnames'
import React from 'react'

import PUBLIC_PATH from '../../publicPath'
import { useConnection } from '../../settings'

import aaveLogo from './images/aave.png'
import agaveLogo from './images/agave.png'
import alchemixLogo from './images/alchemix.png'
import balancerLogo from './images/balancer.png'
import barnbridgeLogo from './images/barnbridge.png'
import convexLogo from './images/convex.png'
import cowswapLogo from './images/cowswap.png'
import creamLogo from './images/cream.png'
import curveLogo from './images/curve.png'
import honeyswapLogo from './images/honeyswap.png'
import instadappLogo from './images/instadapp.png'
import lidoLogo from './images/lido.png'
import paraswapLogo from './images/paraswap.png'
import reflexerLogo from './images/reflexer.png'
import saddleLogo from './images/saddle.png'
import sushiswapLogo from './images/sushiswap.png'
import uniswapLogo from './images/uniswap.png'
import unitLogo from './images/unit.png'
import yearnLogo from './images/yearn.png'
import { getAppUsageCount, markAppAsUsed } from './localStorage'
import classes from './style.module.css'

const APP_CONFIG = [
  {
    name: 'Uniswap',
    url: 'https://app.uniswap.org',
    logoUrl: uniswapLogo,
    networks: [1, 4],
  },
  {
    name: 'Honeyswap',
    url: 'https://app.honeyswap.org',
    logoUrl: honeyswapLogo,
    networks: [100],
  },
  {
    name: 'Curve',
    url: 'https://curve.fi/',
    logoUrl: curveLogo,
    networks: [1],
  },
  {
    name: 'Curve',
    url: 'https://xdai.curve.fi/',
    logoUrl: curveLogo,
    networks: [100],
  },
  {
    name: 'Aave',
    url: 'https://app.aave.com/#/markets',
    logoUrl: aaveLogo,
    networks: [1],
  },
  {
    name: 'Agave',
    url: 'https://app.agave.finance/#/markets',
    logoUrl: agaveLogo,
    networks: [100],
  },
  {
    name: 'Balancer',
    url: 'https://app.balancer.fi/#/',
    logoUrl: balancerLogo,
    networks: [1],
  },
  {
    name: 'Convex',
    url: 'https://www.convexfinance.com/stake',
    logoUrl: convexLogo,
    networks: [1],
  },
  {
    name: 'Alchemix',
    url: 'https://app.alchemix.fi/',
    logoUrl: alchemixLogo,
    networks: [1],
  },
  {
    name: 'Instadapp',
    url: 'https://defi.instadapp.io/',
    logoUrl: instadappLogo,
    networks: [1],
  },
  {
    name: 'Reflexer',
    url: 'https://app.reflexer.finance/#/',
    logoUrl: reflexerLogo,
    networks: [1],
  },
  {
    name: 'Cowswap',
    url: 'https://cowswap.exchange/#/swap',
    logoUrl: cowswapLogo,
    networks: [1, 4, 100],
  },
  {
    name: 'Saddle',
    url: 'https://saddle.exchange/#/',
    logoUrl: saddleLogo,
    networks: [1],
  },
  {
    name: 'Barnbridge',
    url: 'https://app.barnbridge.com/smart-alpha/pools',
    logoUrl: barnbridgeLogo,
    networks: [1],
  },
  {
    name: 'Paraswap',
    url: 'https://paraswap.io/#/',
    logoUrl: paraswapLogo,
    networks: [1],
  },
  {
    name: 'Sushiswap',
    url: 'https://app.sushi.com/',
    logoUrl: sushiswapLogo,
    networks: [1, 4, 100],
  },
  { name: 'Unit', url: 'https://unit.xyz/', logoUrl: unitLogo, networks: [1] },
  {
    name: 'Cream',
    url: 'https://app.cream.finance/',
    logoUrl: creamLogo,
    networks: [1],
  },
  {
    name: 'Yearn',
    url: 'https://yearn.finance/#/home',
    logoUrl: yearnLogo,
    networks: [1],
  },
  {
    name: 'Lido',
    url: 'https://stake.lido.fi/',
    logoUrl: lidoLogo,
    networks: [1],
  },
]

interface Props {
  query?: string
  onPick: (a: string) => void
  large?: boolean
}

const AppPicker: React.FC<Props> = ({ onPick, query = '', large }) => {
  const {
    connection: { chainId },
  } = useConnection()

  const apps = sortApps().filter(
    (app) =>
      chainId &&
      app.networks.includes(chainId) &&
      app.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <ul className={cn(classes.container, large && classes.large)}>
      {apps.map((app) => (
        <li key={app.name} style={{ display: 'block' }}>
          <button
            onClick={() => {
              markAppAsUsed(app.url)
              onPick(app.url)
            }}
            className={classes.item}
          >
            <img
              className={classes.logo}
              src={PUBLIC_PATH + app.logoUrl}
              alt={app.name + ' logo'}
            />
            <div className={classes.name}>{app.name}</div>
          </button>
        </li>
      ))}
    </ul>
  )
}

function sortApps() {
  const withCount = APP_CONFIG.map((app) => ({
    app,
    usage: getAppUsageCount(app.url),
  }))

  const usedAppsSorted = withCount
    .filter(({ usage }) => usage > 0)
    .sort((a, b) => b.usage - a.usage)
    .map(({ app }) => app)

  const unusedApps = withCount
    .filter(({ usage }) => usage === 0)
    .map(({ app }) => app)

  return [...usedAppsSorted, ...unusedApps]
}

export default AppPicker
