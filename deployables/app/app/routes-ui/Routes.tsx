import classNames from 'classnames'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'

type Orientation = 'horizontal' | 'vertical'

const RoutesContext = createContext<{
  selectedRouteId?: string
  form?: string
  disabled: boolean
  orientation: Orientation
}>({
  selectedRouteId: undefined,
  form: undefined,
  disabled: true,
  orientation: 'vertical',
})

const useSelectedRouteId = () => {
  const { selectedRouteId } = useContext(RoutesContext)

  return selectedRouteId
}

const useForm = () => {
  const { form } = useContext(RoutesContext)

  return form
}

const useDisabled = () => {
  const { disabled } = useContext(RoutesContext)

  return disabled
}

export const useOrientation = () => {
  const { orientation } = useContext(RoutesContext)

  return orientation
}

type RoutesProps = PropsWithChildren<{
  id?: string
  form?: string
  defaultValue?: string
  disabled?: boolean
  orientation?: Orientation
}>

export const Routes = ({
  children,
  id,
  form,
  defaultValue,
  disabled = false,
  orientation = 'vertical',
}: RoutesProps) => {
  const [selectedRouteId, setSelectedRouteId] = useState(defaultValue)

  return (
    <div className="flex w-full snap-x snap-mandatory scroll-pl-2 overflow-x-scroll overscroll-contain scroll-smooth rounded-md border border-zinc-200 bg-zinc-50 px-2 py-2 dark:border-zinc-700 dark:bg-zinc-900">
      <fieldset
        id={id}
        className="flex gap-1"
        disabled={disabled}
        onChange={(event) => {
          if (event.target instanceof HTMLInputElement) {
            setSelectedRouteId(event.target.value)
          }
        }}
      >
        <RoutesContext value={{ selectedRouteId, form, disabled, orientation }}>
          {children}
        </RoutesContext>
      </fieldset>
    </div>
  )
}

type RouteProps = PropsWithChildren<{
  id?: string
  name?: string
  inputId?: string
  descriptionId?: string
}>

export const Route = ({
  children,
  id,
  name,
  inputId,
  descriptionId,
}: RouteProps) => {
  const selectedRouteId = useSelectedRouteId()
  const inputRef = useRef<HTMLInputElement>(null)
  const selected = selectedRouteId === id
  const disabled = useDisabled()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selected === false) {
      return
    }

    if (ref.current == null) {
      return
    }

    ref.current.scrollIntoView()
  }, [selected])

  const form = useForm()
  const orientation = useOrientation()

  return (
    <div ref={ref} className="flex snap-start list-none flex-col items-center">
      {name && (
        <div className="sr-only">
          <input
            id={inputId}
            aria-describedby={descriptionId}
            type="radio"
            ref={inputRef}
            name={name}
            form={form}
            value={id}
            defaultChecked={selected}
          />
        </div>
      )}

      <button
        data-testid={id}
        id={name == null ? inputId : undefined}
        aria-describedby={name == null ? descriptionId : undefined}
        type="button"
        disabled={disabled}
        className={classNames(
          'flex justify-center rounded-md border px-2 py-2 outline-none',

          orientation === 'vertical' && 'w-44',
          disabled === false &&
            'cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/10 focus:border-indigo-500 focus:bg-indigo-500/10 dark:hover:border-teal-500 dark:hover:bg-teal-500/10 dark:focus:border-teal-500 dark:focus:bg-teal-500/10',
          selected
            ? 'border-indigo-500 bg-indigo-500/10 dark:border-teal-500 dark:bg-teal-500/10'
            : 'border-transparent',
        )}
        onClick={() => {
          if (inputRef.current == null) {
            return
          }

          inputRef.current.click()
        }}
      >
        {children}
      </button>
    </div>
  )
}
