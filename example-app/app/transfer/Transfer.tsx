import { Button, Input } from '@/components'
import { useWagmiConfig } from '@/config'
import { invariant } from '@epic-web/invariant'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { parseUnits } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'
import { wethContract } from '../wethContract'
import { Balance } from './balance'
import { Gas } from './Gas'
import { wethAbi } from './wethAbi'

type Target = 'ETH' | 'WETH'

export const Transfer = () => {
  const account = useAccount()
  const [config] = useWagmiConfig()
  const [target, setTarget] = useState<Target>('WETH')
  const { writeContract, error } = useWriteContract({
    config,
  })

  if (account.address == null) {
    return null
  }

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault()

        const data = new FormData(event.currentTarget)

        switch (target) {
          case 'ETH': {
            writeContract({
              abi: wethAbi,
              functionName: 'withdraw',
              address: wethContract,
              account: account.address,
              chain: account.chain,
              args: [parseUnits(getString(data, 'weth'), 18)],
            })

            break
          }

          case 'WETH': {
            writeContract({
              abi: wethAbi,
              functionName: 'deposit',
              address: wethContract,
              account: account.address,
              chain: account.chain,
              value: parseUnits(getString(data, 'eth'), 18),
            })

            break
          }
        }
      }}
    >
      {error && error.message}

      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-2">
          <Input
            disabled={target === 'ETH'}
            required={target === 'WETH'}
            step="0.000000000000000001"
            label="ETH"
            name="eth"
            placeholder="0"
            type="number"
          >
            <Balance address={account.address} />
          </Input>
        </div>

        <div className="flex items-center justify-center">
          <button
            type="button"
            className="rounded p-2 hover:bg-gray-100"
            onClick={() => setTarget(target === 'ETH' ? 'WETH' : 'ETH')}
          >
            {target === 'WETH' ? (
              <>
                <span className="sr-only">Swap WETH to ETH</span>
                <ChevronRight />
              </>
            ) : (
              <>
                <span className="sr-only">Swap ETH to WETH</span>
                <ChevronLeft />
              </>
            )}
          </button>
        </div>

        <div className="col-span-2">
          <Input
            disabled={target === 'WETH'}
            required={target === 'ETH'}
            step="0.000000000000000001"
            label="WETH"
            name="weth"
            placeholder="0"
            type="number"
          >
            <Balance address={account.address} token={wethContract} />
          </Input>
        </div>
      </div>

      <Button type="submit">Transfer</Button>

      <div className="flex justify-end">
        <Gas />
      </div>
    </form>
  )
}

const getString = (data: FormData, key: string) => {
  const value = data.get(key)

  invariant(
    typeof value === 'string',
    `Expected value to be of type "string" but got "${typeof value}"`,
  )

  return value
}
