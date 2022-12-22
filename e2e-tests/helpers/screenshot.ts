import mkdirp from 'mkdirp'
import path from 'path'
import { Page } from 'puppeteer'
import { promises } from 'fs'

export const screenshot = async (
  page: Page,
  label = expect.getState().currentTestName
) => {
  const dir = path.resolve(__dirname, '../output/screenshots')
  mkdirp.sync(dir)

  const finalLabel = (label || 'unlabeled').replace(/ /g, '-').replace(/"/g, '')

  const date = new Date()
  const timeFormatted = `${date.getHours()}h${date.getMinutes()}m${date.getSeconds()}s`

  const filename = `${finalLabel}-${timeFormatted}`

  await page.screenshot({
    path: `${dir}/${filename}.png`,
    type: 'png',
    fullPage: true,
  })

  await promises.writeFile(`${dir}/${filename}.html`, await page.content())
}
