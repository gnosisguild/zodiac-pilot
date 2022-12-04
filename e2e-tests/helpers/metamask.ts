import { getDocument, queries } from 'pptr-testing-library'

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
