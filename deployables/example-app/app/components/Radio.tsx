import {
  ComponentPropsWithoutRef,
  createContext,
  PropsWithChildren,
  useContext,
  useId,
} from 'react'

type RadioProps = PropsWithChildren<
  Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'id'>
>

export const Radio = ({ children, name, ...props }: RadioProps) => {
  const id = useId()
  const groupName = useGroupName()

  return (
    <div className="flex items-center gap-2">
      <input {...props} id={id} type="radio" name={name || groupName} />
      <label htmlFor={id}>{children}</label>
    </div>
  )
}

const RadioContext = createContext('default')

const useGroupName = () => useContext(RadioContext)

type RadioGroupProps = PropsWithChildren<{ name: string }>

export const RadioGroup = ({ name, children }: RadioGroupProps) => {
  return (
    <RadioContext.Provider value={name}>
      <fieldset className="flex flex-col gap-4">{children}</fieldset>
    </RadioContext.Provider>
  )
}
