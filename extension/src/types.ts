export enum OperationType {
  Call = 0,
  DelegateCall = 1,
}

export interface MetaTransaction {
  readonly to: string
  readonly value: string
  readonly data: string
  readonly operation?: OperationType
}
