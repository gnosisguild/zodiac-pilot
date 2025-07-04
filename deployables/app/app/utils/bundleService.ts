export interface BundleData {
  transactions: Transaction[]
  avatar: string
  label: string
  timestamp: number
}

export interface Transaction {
  to?: string
  data?: string
  value?: string
  gasLimit?: string
  gasPrice?: string
  [key: string]: any
}

export interface SetupCall {
  method: string
  params: any[]
}

export class BundleService {
  static async submitBundle(bundleData: BundleData, callbackUrl: string): Promise<boolean> {
    try {
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bundleData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('Failed to submit bundle:', error)
      throw error
    }
  }

  static validateCallbackUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return true
    } catch {
      return false
    }
  }

  static extractAddress(prefixedAddress: string): string {
    const parts = prefixedAddress.split(':')
    return parts.length > 1 ? parts[1] : prefixedAddress
  }

  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  static parseSetupCalls(setupParam: string): SetupCall[] {
    try {
      const decoded = atob(setupParam)
      const parsed = JSON.parse(decoded)
      
      if (!Array.isArray(parsed)) {
        throw new Error('Setup calls must be an array')
      }

      return parsed.map(call => {
        if (!call.method || !Array.isArray(call.params)) {
          throw new Error('Invalid setup call format')
        }
        return {
          method: call.method,
          params: call.params
        }
      })
    } catch (error) {
      console.error('Failed to parse setup calls:', error)
      throw new Error('Invalid setup calls format')
    }
  }
}
