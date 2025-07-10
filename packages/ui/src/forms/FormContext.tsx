export type Context = Record<
  string,
  string | number | boolean | null | undefined
>

type FormContextProps = { context?: Context }

export const FormContext = ({ context }: FormContextProps) => {
  if (context == null) {
    return null
  }

  return (
    <>
      {Object.entries(context).map(
        ([key, value]) =>
          value != null && (
            <input
              type="hidden"
              key={key}
              name={key}
              value={
                typeof value === 'boolean'
                  ? value === true
                    ? 'on'
                    : 'off'
                  : value
              }
            />
          ),
      )}
    </>
  )
}
