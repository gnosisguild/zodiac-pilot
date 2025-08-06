import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const selectOption = async (
  comboboxLabel: string,
  optionLabel: string,
) => {
  await userEvent.click(
    await screen.findByRole('combobox', { name: comboboxLabel }),
  )
  await userEvent.click(
    await screen.findByRole('option', { name: optionLabel }),
  )
}
