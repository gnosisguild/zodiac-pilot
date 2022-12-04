import { queries, within } from 'pptr-testing-library'
import { ElementHandle, JSHandle } from 'puppeteer'

type QueryFunctionName = keyof typeof queries
type QueryFunction = typeof queries[QueryFunctionName]

export const around = <T extends ElementHandle<Element>>(el: T) => {
  let ancestor:
    | JSHandle<unknown>
    | ElementHandle<HTMLElement>
    | ElementHandle<Element> = el
  let result: null | ElementHandle<Element> | ElementHandle<Element>[] = null
  let error: Error | null = null

  const hasResult = (
    result: null | ElementHandle<Element> | ElementHandle<Element>[]
  ) => (Array.isArray(result) ? result.length > 0 : !!result)

  const tryAllAncestors =
    (
      fn: (
        ...args: any
      ) => Promise<ElementHandle<Element> | ElementHandle<Element>[] | null>
    ) =>
    async (...args) => {
      ancestor = await ancestor.getProperty('parentElement')
      while (ancestor && !hasResult(result)) {
        try {
          result = await fn(ancestor, ...args)
        } catch (e) {
          error = e
        }
      }

      if (!hasResult(result) && error) {
        throw error
      }

      return result
    }

  const functionNames = [
    'queryByPlaceholderText',
    'queryAllByPlaceholderText',
    'getByPlaceholderText',
    'getAllByPlaceholderText',
    'findByPlaceholderText',
    'findAllByPlaceholderText',
    'queryByText',
    'queryAllByText',
    'getByText',
    'getAllByText',
    'findByText',
    'findAllByText',
    'queryByLabelText',
    'queryAllByLabelText',
    'getByLabelText',
    'getAllByLabelText',
    'findByLabelText',
    'findAllByLabelText',
    'queryByAltText',
    'queryAllByAltText',
    'getByAltText',
    'getAllByAltText',
    'findByAltText',
    'findAllByAltText',
    'queryByTestId',
    'queryAllByTestId',
    'getByTestId',
    'getAllByTestId',
    'findByTestId',
    'findAllByTestId',
    'queryByTitle',
    'queryAllByTitle',
    'getByTitle',
    'getAllByTitle',
    'findByTitle',
    'findAllByTitle',
    'queryByRole',
    'queryAllByRole',
    'getByRole',
    'getAllByRole',
    'findByRole',
    'findAllByRole',
    'queryByDisplayValue',
    'queryAllByDisplayValue',
    'getByDisplayValue',
    'getAllByDisplayValue',
    'findByDisplayValue',
    'findAllByDisplayValue',
  ]

  return Object.fromEntries(
    functionNames.map((functionName) => [
      functionName,
      tryAllAncestors(queries[functionName]),
    ])
  ) as unknown as ReturnType<typeof within<T>>
}
