import type { HexAddress } from '@zodiac/schema'
import { encode } from '@zodiac/schema'
import { useEffect, useState } from 'react'
import type { ChainId, ExecutionPlan } from 'ser-kit'
import { SignTransaction } from './SignTransaction'

type SignTransactionWithCallbackProps = {
  chainId: ChainId
  walletAddress: HexAddress
  safeAddress: HexAddress
  executionPlan: ExecutionPlan | null
  routeId: string
  transactions: any[]
  disabled?: boolean
  intent?: string
}

export const SignTransactionWithCallback = ({
  chainId,
  walletAddress,
  safeAddress,
  executionPlan,
  routeId,
  transactions,
  disabled = false,
  intent,
}: SignTransactionWithCallbackProps) => {
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null)

  useEffect(() => {
    // Check if this is a temporary route with callback
    const launchData = sessionStorage.getItem(`pilot_launch_${routeId}`)
    if (launchData) {
      const { callback } = JSON.parse(launchData)
      setCallbackUrl(callback)
    }
  }, [routeId])

  const handleSign = async (result: any) => {
    if (callbackUrl) {
      try {
        // Prepare bundle data
        const bundleData = {
          routeId,
          transactions: encode(transactions),
          executionResult: result,
          chainId,
          safeAddress,
          timestamp: new Date().toISOString(),
        }

        // Send to callback URL
        const response = await fetch(callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bundleData),
        })

        if (response.ok) {
          // Clear temporary route data and reload
          sessionStorage.removeItem(`pilot_launch_${routeId}`)
          // Show success message before redirecting
          alert('Transaction bundle successfully sent to callback URL')
          setTimeout(() => {
            window.location.href = '/'
          }, 1000)
        } else {
          throw new Error(`Callback failed with status: ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to send callback:', error)
        alert(
          `Failed to send transaction bundle to callback URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    }
  }

  return (
    <SignTransaction
      chainId={chainId}
      walletAddress={walletAddress}
      safeAddress={safeAddress}
      executionPlan={executionPlan}
      disabled={disabled}
      intent={intent}
      onSign={handleSign}
    />
  )
}
