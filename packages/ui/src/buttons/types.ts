export type Style = 'regular' | 'warning' | 'critical'

export type WithStyle<T> = Omit<T, 'style'> & {
  style?: Style
}
