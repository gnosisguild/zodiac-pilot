import {
  useCallback,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from 'react'
import { Form, useFormAction, useSubmit } from 'react-router'

type RenderProps = {
  submit: () => void
}

type AllowSubmitProps = {
  children: AllowSubmitChildren
  method: ComponentProps<typeof Form>['method']
  formRef: RefObject<null>
}

export type AllowSubmitChildren =
  | ReactNode
  | ((props: RenderProps) => ReactNode)

export const AllowSubmit = ({
  children,
  method,
  formRef,
}: AllowSubmitProps) => {
  const submit = useSubmit()
  const action = useFormAction()

  const submitFromWithin = useCallback(
    () => setTimeout(() => submit(formRef.current, { method, action }), 1),
    [action, formRef, method, submit],
  )

  return typeof children === 'function'
    ? children({ submit: submitFromWithin })
    : children
}
