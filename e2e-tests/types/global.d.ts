import { Dappeteer } from '@chainsafe/dappeteer'
import { Browser } from 'puppeteer'

declare global {
  let metamask: Dappeteer
  let browser: Browser
}

export {}
