type Style = 'regular' | 'warning' | 'critical' | 'contrast'

export type WithStyle<T> = Omit<T, 'style'> & {
  style?: Style
}
