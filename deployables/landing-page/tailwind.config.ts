import zodiacTailwindConfig from '@zodiac/tailwind-config'
import type { Config } from 'tailwindcss'

const tailwindConfig = {
  ...zodiacTailwindConfig,
  content: [...zodiacTailwindConfig.content, './index.html'],
} satisfies Config

export default tailwindConfig
