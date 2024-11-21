import { ComponentProps, ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router-dom'
import { BaseButton, BaseLinkButton } from './BaseButton'

export const BoxButton = (
  props: Omit<ComponentPropsWithoutRef<'button'>, 'className'>
) => (
  <BaseButton
    {...props}
    className="border-zodiac-light-mustard/30 bg-zodiac-light-mustard/10 px-4 py-1 text-white enabled:hover:border-zodiac-light-mustard/80"
  />
)

export const BoxLink = (
  props: Omit<ComponentProps<typeof Link>, 'className'>
) => (
  <BaseLinkButton
    {...props}
    className="border-zodiac-light-mustard/30 bg-zodiac-light-mustard/10 px-4 py-1 text-white hover:border-zodiac-light-mustard/80"
  />
)
