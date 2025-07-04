import React, { useEffect, useState } from 'react'
import {
    useParams,
    useSearchParams,
    useNavigate,
    type LoaderFunctionArgs,
    type MetaFunction
} from '@remix-run/react'
import { json } from '@remix-run/node'
import { isAddress, type Address } from 'viem'
import { toast } from 'react-toastify'

export const meta: MetaFunction = () => {
    return [
        { title: 'Zodiac Pilot - Transaction Recording' },
        {
            name: 'description',
            content: 'Record transactions for Railgun integration'
        },
    ]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
    const { prefixedAvatarAddress, accountLabel } = params
    const url = new URL(request.url)
    const setup = url.searchParams.get('setup')
    const callback = url.searchParams.get('callback')

    if (!prefixedAvatarAddress || !accountLabel) {
        throw new Response('Missing required parameters', { status: 400 })
    }

    if (!callback) {
        throw new Response('Callback URL is required', { status: 400 })
    }

    // Validate callback URL format
    try {
        new URL(callback)
    } catch {
        throw new Response('Invalid callback URL', { status: 400 })
    }

    return json({
        prefixedAvatarAddress,
        accountLabel,
        setup,
        callback
    })
}

interface SetupCall {
    method: string
    params: any[]
}

interface BundleData {
    transactions: any[]
    avatar: string
    label: string
    timestamp: number
}

interface Transaction {
    to?: string
    data?: string
    value?: string
    [key: string]: any
}

export default function LaunchRoute() {
    const { prefixedAvatarAddress, accountLabel } = useParams<{
        prefixedAvatarAddress: string
        accountLabel: string
    }>()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [isSetupComplete, setIsSetupComplete] = useState(false)
    const [callbackUrl, setCallbackUrl] = useState<string | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [avatarAddress, setAvatarAddress] = useState<Address | null>(null)

    useEffect(() => {
        if (!prefixedAvatarAddress || !accountLabel) {
            toast.error('Invalid launch parameters')
            navigate('/')
            return
        }

        // Extract address from prefixed format (e.g., remove chain prefix)
        const address = extractAddress(prefixedAvatarAddress)
        if (!isAddress(address)) {
            toast.error('Invalid avatar address')
            navigate('/')
            return
        }

        setAvatarAddress(address)

        // Get setup calls and callback URL from query params
        const setupParam = searchParams.get('setup')
        const callbackParam = searchParams.get('callback')

        if (!callbackParam) {
            toast.error('Callback URL is required')
            navigate('/')
            return
        }

        setCallbackUrl(callbackParam)

        // Execute setup RPC calls if provided
        if (setupParam) {
            executeSetupCalls(setupParam, address)
        } else {
            setIsSetupComplete(true)
        }

        // Listen for transaction recording events
        const handleTransactionRecorded = (event: CustomEvent) => {
            setTransactions(prev => [...prev, event.detail])
        }

        window.addEventListener('transactionRecorded', handleTransactionRecorded as EventListener)

        // Cleanup on unmount
        return () => {
            window.removeEventListener('transactionRecorded', handleTransactionRecorded as EventListener)
        }
    }, [prefixedAvatarAddress, accountLabel, searchParams, navigate])

    const extractAddress = (prefixedAddress: string): string => {
        // Handle different prefix formats (e.g., eth:0x..., polygon:0x...)
        const parts = prefixedAddress.split(':')
        return parts.length > 1 ? parts[1] : prefixedAddress
    }

    const executeSetupCalls = async (setupParam: string, avatarAddress: string) => {
        try {
            // Decode setup calls (assuming base64 encoded JSON)
            const setupCalls: SetupCall[] = JSON.parse(atob(setupParam))

            // Execute each setup call to spoof blockchain state
            for (const call of setupCalls) {
                await executeSetupCall(call, avatarAddress)
            }

            setIsSetupComplete(true)
            toast.success('Avatar setup completed')
        } catch (error) {
            console.error('Failed to execute setup calls:', error)
            toast.error('Failed to set up avatar state')
            navigate('/')
        }
    }

    const executeSetupCall = async (call: SetupCall, avatarAddress: string): Promise<void> => {
        try {
            // This would interface with the simulation provider
            // For now, we'll just log the call
            console.log(`Executing setup call ${call.method} for ${avatarAddress}:`, call.params)

            // TODO: Integrate with actual simulation provider
            // await simulationProvider.send(call.method, call.params)

        } catch (error) {
            console.error(`Failed to execute setup call ${call.method}:`, error)
            throw error
        }
    }

    const handleSubmit = async () => {
        if (!callbackUrl || !prefixedAvatarAddress) return

        try {
            const bundleData: BundleData = {
                transactions,
                avatar: prefixedAvatarAddress,
                label: accountLabel || 'Unknown',
                timestamp: Date.now()
            }

            // Post bundle data to callback URL
            const response = await fetch(callbackUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bundleData)
            })

            if (response.ok) {
                toast.success('Bundle data submitted successfully')
                // Clear the panel and close
                setTransactions([])
                window.close() // Close the panel/window
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
        } catch (error) {
            console.error('Failed to submit bundle data:', error)
            toast.error('Failed to submit bundle data')
        }
    }

    const handleCancel = () => {
        setTransactions([])
        navigate('/')
    }

    const clearTransactions = () => {
        setTransactions([])
    }

    if (!isSetupComplete) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center bg-white rounded-lg shadow-lg p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-700 text-lg">Setting up avatar state...</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Preparing simulation environment for {accountLabel}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Transaction Recording - {accountLabel}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Avatar: {prefixedAvatarAddress}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Railgun Integration Mode
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={clearTransactions}
                                disabled={transactions.length === 0}
                                className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={transactions.length === 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Submit Bundle ({transactions.length})
                            </button>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        {transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        className="w-12 h-12 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-lg">
                                    No transactions recorded yet
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Start interacting with dApps to record transactions
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Recorded Transactions
                                    </h2>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                    {transactions.map((tx, index) => (
                                        <div key={index} className="bg-white rounded p-3 mb-2 shadow-sm border border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    {tx.to && (
                                                        <div className="text-sm font-medium text-gray-900 mb-1">
                                                            To: <code className="text-xs bg-gray-100 px-1 rounded">{tx.to}</code>
                                                        </div>
                                                    )}
                                                    {tx.data && (
                                                        <div className="text-xs text-gray-500 mt-1 font-mono">
                                                            Data: {tx.data.slice(0, 42)}
                                                            {tx.data.length > 42 && '...'}
                                                        </div>
                                                    )}
                                                    {tx.value && (
                                                        <div className="text-xs text-gray-500">
                                                            Value: {tx.value} ETH
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-400 ml-4">
                                                    #{index + 1}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}