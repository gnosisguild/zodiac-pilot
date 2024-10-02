import { Button, Input } from '@/components'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Balance } from './Balance'
import { Gas } from './Gas'

type Target = 'ETH' | 'WETH'

export const Transfer = () => {
  const account = useAccount()

  const [target, setTarget] = useState<Target>('WETH')

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >
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
            <Balance
              address={account.address}
              contract="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
            />
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
