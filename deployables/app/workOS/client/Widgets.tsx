import '@radix-ui/themes/styles.css'
import { WorkOsWidgets } from '@workos-inc/widgets'
import '@workos-inc/widgets/styles.css'
import { useIsDark } from '@zodiac/ui'
import { Suspense, type PropsWithChildren } from 'react'

export const Widgets = ({ children }: PropsWithChildren) => {
  const dark = useIsDark()

  return (
    <Suspense>
      {WorkOsWidgets && (
        <WorkOsWidgets
          theme={{
            appearance: dark ? 'dark' : 'light',
            hasBackground: false,
            accentColor: dark ? 'teal' : 'indigo',
          }}
        >
          {children}
        </WorkOsWidgets>
      )}
    </Suspense>
  )
}
