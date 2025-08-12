import { ReactNode, useMemo } from 'react'
import { OptionProps, SingleValueProps } from 'react-select'

export type OptionRenderProps<
  Option extends BaseOption,
  isMulti extends boolean,
> = (
  props: OptionProps<Option, isMulti> | SingleValueProps<Option, isMulti>,
) => ReactNode

export type BaseOption<T extends string | number = string | number> = {
  label?: string | null
  value: T
}

export function useOptionRenderer<
  Option extends BaseOption,
  isMulti extends boolean,
>(children: OptionRenderProps<Option, isMulti> | undefined) {
  return useMemo(() => {
    if (children == null) {
      return (props: OptionProps<Option, isMulti>) => (
        <div
          {...props.innerProps}
          className={props.getClassNames('option', props)}
        >
          {props.data.label}
        </div>
      )
    }

    return (props: OptionProps<Option, isMulti>) => (
      <div
        {...props.innerProps}
        className={props.getClassNames('option', props)}
      >
        {children(props)}
      </div>
    )
  }, [children])
}

export function useSingleValueRenderer<
  Option extends BaseOption,
  isMulti extends boolean,
>(children: OptionRenderProps<Option, isMulti> | undefined) {
  return useMemo(() => {
    if (children == null) {
      return (props: SingleValueProps<Option, isMulti>) => (
        <div
          {...props.innerProps}
          className={props.getClassNames('singleValue', props)}
          style={{ gridArea: '1 / 1 / 2 / 3 ' }}
        >
          {props.data.label}
        </div>
      )
    }

    return (props: SingleValueProps<Option, isMulti>) => (
      <div
        {...props.innerProps}
        className={props.getClassNames('singleValue', props)}
        style={{ gridArea: '1 / 1 / 2 / 3 ' }}
      >
        {children(props)}
      </div>
    )
  }, [children])
}
