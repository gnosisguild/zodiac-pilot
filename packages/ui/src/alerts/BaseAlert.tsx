import { invariant } from '@epic-web/invariant'
import classNames from 'classnames'
import { createContext, type PropsWithChildren, useContext, useId } from 'react'

type BaseAlertProps = PropsWithChildren<{
  className?: string
}>

export const BaseAlert = ({ children, className }: BaseAlertProps) => {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <AlertContext.Provider value={{ titleId, descriptionId }}>
      <div
        role="alert"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={classNames(
          'px flex flex-col gap-2 text-balance rounded-xs border px-4 py-2 text-sm shadow-md',
          className,
        )}
      >
        {children}
      </div>
    </AlertContext.Provider>
  )
}

const Title = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <h4 id={useTitleId()} className={classNames('font-bold', className)}>
    {children}
  </h4>
)

BaseAlert.Title = Title

const Description = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => (
  <div id={useDescriptionId()} className={className}>
    {children}
  </div>
)

BaseAlert.Description = Description

const AlertContext = createContext<{
  titleId: string | null
  descriptionId: string | null
}>({
  titleId: null,
  descriptionId: null,
})

const useTitleId = () => {
  const { titleId } = useContext(AlertContext)

  invariant(titleId != null, 'No "titleId" alert context found')

  return titleId
}

const useDescriptionId = () => {
  const { descriptionId } = useContext(AlertContext)

  invariant(descriptionId != null, 'No "descriptionId" alert context found')

  return descriptionId
}
