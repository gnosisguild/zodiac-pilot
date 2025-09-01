import { isValidToken } from '@/balances-server'
import { getHexString, getString } from '@zodiac/form-data'
import { isHexAddress, type HexAddress } from '@zodiac/schema'
import { Error as ErrorAlert, Form, PrimaryButton } from '@zodiac/ui'
import {
  AddressInput,
  useSendTransaction,
  useWriteContract,
} from '@zodiac/web3'
import { useCallback, useEffect } from 'react'
import { href, useNavigate } from 'react-router'
import { erc20Abi } from 'viem'
import type { Route } from './+types/send'
import { TokenValueInput } from './TokenValueInput'

export const meta: Route.MetaFunction = () => [{ title: 'Pilot | Send tokens' }]

export const loader = async ({
  params: { token, chain },
}: Route.LoaderArgs) => {
  if (token == null || chain == null) {
    return { defaultToken: null }
  }

  const tokenLowerCase = token.toLowerCase()

  const isValid = await isValidToken(chain, tokenLowerCase)

  if (isValid) {
    return { defaultToken: tokenLowerCase }
  }

  return { defaultToken: null }
}

const Send = ({
  loaderData: { defaultToken },
  params: { workspaceId },
}: Route.ComponentProps) => {
  const { sendToken, isSuccess, isPending, error } = useSendToken()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSuccess) {
      navigate(
        workspaceId == null
          ? href('/offline/tokens/balances')
          : href('/workspace/:workspaceId/tokens/balances', { workspaceId }),
      )
    }
  }, [isSuccess, navigate, workspaceId])

  return (
    <Form
      onSubmit={(ev) => {
        const data = new FormData(ev.currentTarget)

        const recipient = getHexString(data, 'recipient')
        const value = BigInt(getString(data, 'amount'))

        const token = getString(data, 'token')

        sendToken({
          token,
          recipient,
          value,
        })

        ev.preventDefault()
        ev.stopPropagation()
      }}
    >
      <AddressInput required label="Recipient" name="recipient" />

      <TokenValueInput
        required
        label="Amount"
        name="amount"
        defaultToken={defaultToken}
      />

      <Form.Actions>
        <PrimaryButton submit busy={isPending}>
          Send
        </PrimaryButton>
      </Form.Actions>

      {error && <ErrorAlert title={error.message}>{error.stack}</ErrorAlert>}
    </Form>
  )
}

export default Send

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  if (error instanceof Error) {
    return (
      <ErrorAlert title="Sending tokens is not possible">
        {error.message}
      </ErrorAlert>
    )
  }
}

type SendTokenOptions = {
  token: string
  recipient: HexAddress
  value: bigint
}

const useSendToken = () => {
  const { writeContract, ...writeContractProps } = useWriteContract()
  const { sendTransaction, ...sendTransactionProps } = useSendTransaction()

  const sendToken = useCallback(
    ({ token, recipient, value }: SendTokenOptions) => {
      if (isHexAddress(token)) {
        writeContract({
          abi: erc20Abi,
          address: token,
          functionName: 'transfer',
          args: [recipient, value],
        })
      } else {
        sendTransaction({ to: recipient, value })
      }
    },
    [sendTransaction, writeContract],
  )

  return {
    sendToken,
    isSuccess: writeContractProps.isSuccess || sendTransactionProps.isSuccess,
    isPending: writeContractProps.isPending || sendTransactionProps.isPending,
    error: writeContractProps.error || sendTransactionProps.error,
  }
}
