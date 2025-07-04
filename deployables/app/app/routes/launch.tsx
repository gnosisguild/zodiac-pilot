import React, { useEffect, useState } from 'react'
import { 
  useParams, 
  useSearchParams, 
  useNavigate,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/react'
import { json } from '@remix-run/node'

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

  return json({
    prefixedAvatarAddress,
    accountLabel,
    setup,
    callback
  })
}

export default function LaunchRoute() {
  const { prefixedAvatarAddress, accountLabel } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  
  useEffect(() => {
    const callbackParam = searchParams.get('callback')
    if (callbackParam) {
      setCallbackUrl(callbackParam)
      setIsSetupComplete(true)
    }
  }, [searchParams])

  const handleSubmit = async () => {
    if (!callbackUrl || !prefixedAvatarAddress) return

    try {
      const bundleData = {
        transactions,
        avatar: prefixedAvatarAddress,
        label: accountLabel || 'Unknown',
        timestamp: Date.now()
      }

      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bundleData)
      })

      if (response.ok) {
        alert('Bundle data submitted successfully')
        setTransactions([])
        window.close()
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to submit bundle data:', error)
      alert('Failed to submit bundle data')
    }
  }

  if (!isSetupComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Setting up avatar state...</p>
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
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={transactions.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Submit Bundle ({transactions.length})
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No transactions recorded yet
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Start interacting with dApps to record transactions
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recorded Transactions ({transactions.length})
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {transactions.map((tx, index) => (
                    <div key={index} className="bg-white rounded p-3 mb-2 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {tx.to && (
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              To: {tx.to}
                            </div>
                          )}
                          {tx.data && (
                            <div className="text-xs text-gray-500 mt-1 font-mono">
                              Data: {tx.data.slice(0, 42)}...
                            </div>
                          )}
                          {tx.value && (
                            <div className="text-xs text-gray-500">
                              Value: {tx.value} ETH
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
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
