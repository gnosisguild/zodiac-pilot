import { Page } from '@playwright/test'
import { readFileSync } from 'fs'
import { MutableRefObject } from 'react'
import { fileURLToPath } from 'url'

const web3Content: MutableRefObject<string | null> = { current: null }

declare global {
  type mock = {
    trigger: (event: string) => void
  }

  const Web3Mock: mock
}

export const mockWeb3 = (page: Page, fn: () => unknown) => {
  page.addInitScript({
    content: `${getLibraryCode()}\n(${fn.toString().replaceAll('mock', 'Web3Mock.mock')})()`,
  })

  return {
    trigger(event: string) {
      return page.evaluate(() => Web3Mock.trigger(event))
    },
  }
}

const getLibraryCode = () => {
  if (web3Content.current == null) {
    web3Content.current = readFileSync(
      fileURLToPath(
        import.meta.resolve('@depay/web3-mock/dist/umd/index.bundle.js')
      ),
      'utf-8'
    )
  }

  return web3Content.current
}
