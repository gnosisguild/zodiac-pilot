import { getDocument, queries, within } from 'pptr-testing-library'
import { launch } from './launch'

export const confirm = async (
  prompt?: string,
  primaryButtonCaption?: string
) => {
  await metamask.page.bringToFront()
  await metamask.page.reload()
  const $doc = await getDocument(metamask.page)

  if (prompt) {
    await queries.findByText($doc, prompt)
  }

  const $$primaryButtons = await $doc.$$('button.btn-primary')
  const $lastPrimaryButton = $$primaryButtons[$$primaryButtons.length - 1]

  if (primaryButtonCaption) {
    const caption = await $lastPrimaryButton.evaluate((el) => el.textContent)
    expect(caption).toBe(primaryButtonCaption)
  }

  await $lastPrimaryButton.click()
}

export const switchToGnosisChain = async () => {
  await navigateTo('settings/networks')

  const $doc = await getDocument(metamask.page)
  await queries.findAllByText($doc, 'Networks')

  const $$networks = await queries.queryAllByText($doc, 'Gnosis Chain')
  if ($$networks.length === 0) {
    await metamask.addNetwork({
      chainId: 100,
      networkName: 'Gnosis Chain',
      rpc: 'https://rpc.gnosischain.com',
      symbol: 'xDAI',
    })
  }

  await navigateTo('')
  await metamask.switchNetwork('Gnosis Chain')
}

export const connectToPilot = async () => {
  // do nothing if already connected
  await navigateTo('connected')
  const $doc = await getDocument(metamask.page)
  await queries.findByText($doc, 'Connected sites')
  const $pilotConnected = await queries.queryByText(
    $doc,
    'pilot.gnosisguild.org'
  )
  await navigateTo('')
  if ($pilotConnected) return

  // connect by launching Pilot
  const page = await launch('jan')
  await metamask.approve()
  await page.close()
}

export const disconnect = async () => {
  await navigateTo('connected')
  const $doc = await getDocument(metamask.page)
  await queries.findByText($doc, 'Connected sites')
  const $disconnect = await queries.queryByText($doc, 'Disconnect')
  if ($disconnect) {
    await $disconnect.click()

    // confirm the disconnect in popover
    // confirm in delete modal
    const $popover = await $doc.$('#popover-content')
    const $confirm = await within($popover).getByText('Disconnect')
    await $confirm.click()
  }

  await navigateTo('')
}

export const removeNetwork = async (networkName: string) => {
  // make sure we are not connected to the network we want to remove
  await metamask.switchNetwork('Ethereum Mainnet')
  await navigateTo('settings/networks')

  const $doc = await getDocument(metamask.page)
  await queries.findByText($doc, 'Add a network')

  const $networksList = await $doc.$('.networks-tab__networks-list')
  const $network = await within($networksList).queryByText(networkName)
  if ($network) {
    await $network.click()

    const $delete = await queries.getByText($doc, 'Delete')
    await $delete.click()

    // confirm delete in modal
    const $modal = await $doc.$('.modal')
    const $confirm = await within($modal).getByText('Delete')
    await $confirm.click()
  }

  await navigateTo('')
}

export const navigateTo = async (route: string) => {
  const baseUrl = metamask.page.url().split('#')[0]
  await metamask.page.goto(`${baseUrl}#${route}`)
  await metamask.page.reload()
}
