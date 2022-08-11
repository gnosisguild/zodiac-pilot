export type Connection = {
  id: string
  label: string
  moduleAddress: string
  avatarAddress: string
  roleId: string
}

export interface JsonRpcRequest {
  method: string
  params?: Array<any>
}
