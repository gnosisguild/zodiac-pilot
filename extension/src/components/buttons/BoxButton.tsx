import {
  BaseButton,
  BaseButtonProps,
  BaseLinkButton,
  BaseLinkButtonProps,
} from './BaseButton'

export const BoxButton = (props: Omit<BaseButtonProps, 'className'>) => (
  <BaseButton
    {...props}
    className="border-zodiac-light-mustard/30 bg-zodiac-light-mustard/10 px-4 py-1 text-white enabled:hover:border-zodiac-light-mustard/80"
  />
)

export const BoxLink = (props: Omit<BaseLinkButtonProps, 'className'>) => (
  <BaseLinkButton
    {...props}
    className="border-zodiac-light-mustard/30 bg-zodiac-light-mustard/10 px-4 py-1 text-white hover:border-zodiac-light-mustard/80"
  />
)
