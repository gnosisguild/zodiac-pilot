import { Dappeteer } from '@chainsafe/dappeteer'
import { Browser, Page } from 'puppeteer'

describe('initial launch', () => {
  it('should show the settings of the default connection on first ever launch', async () => {
    const page = await browser.newPage()
    await page.goto('https://pilot.gnosisguild.org')
    const $addConn = await page.waitForSelector('._button_137m7_1')
    console.log('ok', await page.content())
    expect($addConn).toBeFalsy()
  })

  it.todo(
    'should show the connections list if multiple connections are stored but the selected one is not ready'
  )
  it.todo('should show the browser if the selected connection is ready')
})
