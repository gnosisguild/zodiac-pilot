import { Page } from '@/components'
import { ZodiacOsLogo } from '@zodiac/ui'

const Connect = () => {
  return (
    <Page>
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-4">
          <ZodiacOsLogo className="h-6 lg:h-8" />
        </div>
      </div>
    </Page>
  )
}

export default Connect
