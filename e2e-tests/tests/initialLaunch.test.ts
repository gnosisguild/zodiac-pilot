import { getDocument, queries, waitFor } from 'pptr-testing-library'
import { launch, launchFresh } from '../helpers/launch'

describe('initial launch', () => {
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

  it('should show the browser if the selected connection is ready', async () => {
    const page = await launch('jan')
    const $doc = await getDocument(page)

    await queries.findByPlaceholderText($doc, 'Type a url')
    await queries.findByText($doc, 'Jan Test DAO')

    await page.close()
  })
})
