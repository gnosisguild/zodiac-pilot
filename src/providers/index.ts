export { default as ForkProvider } from './ForkProvider'
export { default as WrappingProvider } from './WrappingProvider'
export { default as useWalletConnectProvider } from './useWalletConnectProvider'
export { useGanacheProvider, default as ProvideGanache } from './ProvideGanache'
export {
  useTenderlyProvider,
  default as ProvideTenderly,
} from './ProvideTenderly'
export {
  ProvideMetamask,
  default as useMetamaskProvider,
} from './useMetamaskProvider'

export interface Eip1193Provider {
  request(request: { method: string; params?: Array<any> }): Promise<unknown>
  on(event: string, listener: (...args: any[]) => void): this
  removeListener(event: string, listener: (...args: any[]) => void): this
}
