import { getDocument, queries } from 'pptr-testing-library'
import { launch, launchFresh } from '../helpers/launch'
import * as wallet from '../helpers/metamask'
import { around } from '../helpers/queries'

describe('initial launch', () => {
  jest.setTimeout(30000)

  it('should show the settings of the default connection on first ever launch', async () => {
    const page = await launchFresh()
    const $doc = await getDocument(page)

    await queries.findByText($doc, 'New connection')

    await page.close()
  })

  it('should show the connections list if multiple connections are stored but the selected one is not ready', async () => {
    const page = await launch('gnosis')
    const $doc = await getDocument(page)

    await queries.findByText($doc, 'Connections')
    await queries.findByText($doc, 'Gnosis DAO on GC')

    await page.close()
  })

  it('should ask the user to connect MetaMask and add a new network to MetaMask if necessary', async () => {
    await wallet.removeNetwork('Gnosis Chain')
    await wallet.disconnect()

    const page = await launch('jan')
    const $doc = await getDocument(page)

    // approve the connection request triggered on page load and go back to Pilot page
    await metamask.approve()
    await page.bringToFront()

    // we will see the Connections page now
    await queries.findByText($doc, 'Connections')

    // the jan item has a status of "connected to a different chain"
    const $item = await queries.findByText($doc, 'Jan Test DAO')
    const $status = await around($item).getByRole('status')
    const status = await $status.evaluate((el) => el.textContent)
    expect(status).toBe('Pilot wallet is connected to a different chain')

    // click the connection item to establish the connection
    await $item.click()

    // we will see the MetaMask popup now, need to approve adding the network and then again switching to it
    await wallet.confirm('Allow this site to add a network?', 'Approve')
    await wallet.confirm(
      'Allow this site to switch the network?',
      'Switch network'
    )
    await page.bringToFront()

    await queries.findByPlaceholderText($doc, 'Type a url')
    await queries.findByText($doc, 'Jan Test DAO')

    await page.close()
  })

  it('should show the browser if the selected connection is ready', async () => {
    await wallet.switchToGnosisChain()
    await wallet.connectToPilot()

    const page = await launch('jan')

    const $doc = await getDocument(page)
    await queries.findByPlaceholderText($doc, 'Type a url')
    await queries.findByText($doc, 'Jan Test DAO')
    await page.close()
  })
})

const getActivePage = async () => {
  const pages = await browser.pages()
  for (let i = 0; i < pages.length; i++) {
    const isHidden = await pages[i].evaluate(() => document.hidden)
    if (!isHidden) {
      return pages[i]
    }
  }

  throw new Error('No active page found')
}
