import {
  useCallback,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from 'react'
import { Form, useSubmit } from 'react-router'

type RenderProps = {
  /**
   * Use this callback to programmatically submit this form.
   * Usually you'll want to use a submit button or any other native HTML element.
   * However, in certain situations it can come in handy to submit from other code.
   *
   * @param extraData
   * By default, submit sends all data included in the surrounding form.
   * If yoy need to pass additional data, you can do that here.
   * It will be merged with the other form data.
   * @returns
   */
  submit: (extraData?: FormData) => void
}

type AllowSubmitProps = {
  children: AllowSubmitChildren
  method: ComponentProps<typeof Form>['method']
  formRef: RefObject<null>
  action: string
}

export type AllowSubmitChildren =
  | ReactNode
  | ((props: RenderProps) => ReactNode)

export const AllowSubmit = ({
  children,
  method,
  formRef,
  action,
}: AllowSubmitProps) => {
  const submit = useSubmit()

  const submitFromWithin = useCallback(
    (extraData?: FormData) =>
      setTimeout(() => {
        if (formRef.current == null) {
          submit(null, { method, action })
        } else {
          const data = new FormData(formRef.current)

          if (extraData != null) {
            extraData.forEach((value, key) => data.set(key, value))
          }

          submit(data, { method, action })
        }
      }, 1),
    [action, formRef, method, submit],
  )

  return typeof children === 'function'
    ? children({ submit: submitFromWithin })
    : children
}
