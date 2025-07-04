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
    /**
     * Submit bundle data to the callback URL
     */
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

    /**
     * Validate callback URL format
     */
    static validateCallbackUrl(url: string): boolean {
        try {
            const urlObj = new URL(url)
            // Only allow HTTPS URLs in production
            if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
                return false
            }
            return true
        } catch {
            return false
        }
    }

    /**
     * Extract address from prefixed format
     */
    static extractAddress(prefixedAddress: string): string {
        // Handle different prefix formats (e.g., eth:0x..., polygon:0x...)
        const parts = prefixedAddress.split(':')
        return parts.length > 1 ? parts[1] : prefixedAddress
    }

    /**
     * Validate Ethereum address format
     */
    static isValidAddress(address: string): boolean {
        return /^0x[a-fA-F0-9]{40}$/.test(address)
    }

    /**
     * Parse setup calls from base64 encoded parameter
     */
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

    /**
     * Format transactions for display
     */
    static formatTransaction(tx: Transaction): string {
        const parts = []

        if (tx.to) {
            parts.push(`To: ${tx.to}`)
        }

        if (tx.value && tx.value !== '0') {
            parts.push(`Value: ${tx.value} ETH`)
        }

        if (tx.data && tx.data !== '0x') {
            parts.push(`Data: ${tx.data.slice(0, 42)}...`)
        }

        return parts.join(' | ')
    }

    /**
     * Validate transaction data
     */
    static validateTransaction(tx: Transaction): boolean {
        // Must have either 'to' address or 'data' for contract creation
        if (!tx.to && !tx.data) {
            return false
        }

        // If 'to' is provided, it must be a valid address
        if (tx.to && !this.isValidAddress(tx.to)) {
            return false
        }

        // If data is provided, it must be valid hex
        if (tx.data && !/^0x[a-fA-F0-9]*$/.test(tx.data)) {
            return false
        }

        return true
    }

    /**
     * Create a transaction record from raw data
     */
    static createTransactionRecord(
        to: string | undefined,
        data: string | undefined,
        value: string | undefined,
        additionalData: Record<string, any> = {}
    ): Transaction {
        return {
            to,
            data,
            value: value || '0',
            timestamp: Date.now(),
            ...additionalData
        }
    }
}