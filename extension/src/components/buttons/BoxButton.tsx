import { ComponentProps, ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router-dom'

export const BoxButton = (
  props: Omit<ComponentPropsWithoutRef<'button'>, 'className'>
) => (
  <button
    {...props}
    className="cursor-pointer border border-zodiac-light-mustard/30 bg-zodiac-light-mustard/10 px-4 py-1 text-white enabled:hover:border-zodiac-light-mustard/80 disabled:cursor-not-allowed disabled:opacity-50"
  />
)

export const BoxLink = (
  props: Omit<ComponentProps<typeof Link>, 'className'>
) => (
  <Link
    {...props}
    className="border border-zodiac-light-mustard/30 bg-zodiac-light-mustard/10 px-4 py-1 text-white hover:border-zodiac-light-mustard/80"
  />
)
