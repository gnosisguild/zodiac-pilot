import '@radix-ui/themes/styles.css'
import { WorkOsWidgets } from '@workos-inc/widgets'
import '@workos-inc/widgets/styles.css'
import { Suspense, useEffect, useState, type PropsWithChildren } from 'react'

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

const useIsDark = () => {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const result = window.matchMedia('(prefers-color-scheme: dark)')

    const handleDarkChange = (result: MediaQueryListEvent) => {
      setDark(result.matches)
    }

    result.addEventListener('change', handleDarkChange)

    setDark(result.matches)

    return () => {
      result.removeEventListener('change', handleDarkChange)
    }
  }, [])

  return dark
}
