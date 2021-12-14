export { default as ForkProvider } from './ForkProvider'
export { default as WrappingProvider } from './WrappingProvider'
export {
  useWalletConnectProvider,
  default as ProvideWalletConnect,
} from './ProvideWalletConnect'
export { useGanacheProvider, default as ProvideGanache } from './ProvideGanache'

export interface Eip1193Provider {
  request(request: { method: string; params?: Array<any> }): Promise<unknown>
}
