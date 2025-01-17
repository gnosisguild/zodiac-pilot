export interface JsonRpcRequest {
  method: string
  params?: readonly unknown[] | object
}
