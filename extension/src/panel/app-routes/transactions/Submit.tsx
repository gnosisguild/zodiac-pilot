import { CHAIN_NAME, EXPLORER_URL, getChainId } from '@/chains'
import {
  GhostButton,
  PrimaryButton,
  RawAddress,
  toastClasses,
} from '@/components'
import { getReadOnlyProvider } from '@/providers'
import { useSubmitTransactions } from '@/providers-ui'
import { waitForMultisigExecution } from '@/safe'
import { useTransactions } from '@/state'
import { JsonRpcError, ProviderType } from '@/types'
import {
  decodeGenericError,
  decodeRolesV1Error,
  decodeRolesV2Error,
} from '@/utils'
import { useRouteConnect, useZodiacRoute } from '@/zodiac-routes'
import { SquareArrowOutUpRight, X } from 'lucide-react'
import { useState } from 'react'
import Modal, { Styles } from 'react-modal'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { parsePrefixedAddress, PrefixedAddress } from 'ser-kit'

export const Submit = () => {
  const route = useZodiacRoute()
  const chainId = getChainId(route.avatar)
  const [connected, connect] = useRouteConnect(route)
  const { initiator, providerType, avatar } = route
  const navigate = useNavigate()

  const transactions = useTransactions()
  const submitTransactions = useSubmitTransactions()
  const [signaturePending, setSignaturePending] = useState(false)

  const connectWallet = () => {
    navigate('/routes/' + route.id)
  }

  const submit = async () => {
    if (!connected) {
      if (!connect) throw new Error('invariant violation')

      const success = await connect()
      if (!success) {
        const chainName = CHAIN_NAME[chainId] || `#${chainId}`
        toast.error(
          `Switch your wallet to ${chainName} to submit the transactions`
        )
        return
      }
    }

    if (!submitTransactions) throw new Error('invariant violation')
    setSignaturePending(true)

    let result: {
      txHash?: `0x${string}`
      safeTxHash?: `0x${string}`
    }
    try {
      result = await submitTransactions()
    } catch (e) {
      console.warn(e)
      setSignaturePending(false)
      const err = e as JsonRpcError

      const { name } = decodeRolesV1Error(err) ||
        decodeRolesV2Error(err) || { name: decodeGenericError(err) }
      toast.error(
        <>
          <p>Submitting the transaction batch failed:</p>
          <br />
          <RawAddress>{name}</RawAddress>
        </>,
        { className: toastClasses.toastError }
      )
      return
    }
    setSignaturePending(false)

    const { txHash, safeTxHash } = result
    if (txHash) {
      console.debug(
        `Transaction batch has been submitted with transaction hash ${txHash}`
      )
      const receipt =
        await getReadOnlyProvider(chainId).waitForTransaction(txHash)
      console.debug(`Transaction ${txHash} has been executed`, receipt)

      toast(
        <>
          Transaction batch has been executed
          <a
            href={`${EXPLORER_URL[chainId]}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SquareArrowOutUpRight size={16} />
            View in block explorer
          </a>
        </>
      )
    }

    if (safeTxHash) {
      console.debug(
        `Transaction batch has been proposed with safeTxHash ${safeTxHash}`
      )
      const [, avatarAddress] = parsePrefixedAddress(avatar)
      toast(
        <>
          Transaction batch has been proposed for execution
          <a
            href={`//app.safe.global/transactions/tx?safe=${avatar}&id=multisig_${avatarAddress}_${safeTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SquareArrowOutUpRight size={16} />
            {'View in Safe{Wallet}'}
          </a>
        </>
      )

      // In case the other safe owners are quick enough to sign while the Pilot session is still open, we can show a toast with an execution confirmation
      const txHash = await waitForMultisigExecution(chainId, safeTxHash)
      console.debug(
        `Proposed transaction batch with safeTxHash ${safeTxHash} has been confirmed and executed with transaction hash ${txHash}`
      )
      toast(
        <>
          Proposed Safe transaction has been confirmed and executed{' '}
          <a
            href={`${EXPLORER_URL[chainId]}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SquareArrowOutUpRight size={16} />
            View in block explorer
          </a>
        </>
      )
    }
  }

  return (
    <>
      {connected || connect ? (
        <PrimaryButton
          fluid
          onClick={submit}
          disabled={!submitTransactions || transactions.length === 0}
        >
          Submit
        </PrimaryButton>
      ) : (
        <PrimaryButton
          fluid
          onClick={connectWallet}
          disabled={!submitTransactions || transactions.length === 0}
        >
          Connect wallet to submit
        </PrimaryButton>
      )}

      {signaturePending && initiator && (
        <AwaitingSignatureModal
          isOpen={signaturePending}
          onClose={() => setSignaturePending(false)}
          usesWalletConnect={providerType === ProviderType.WalletConnect}
          account={initiator}
        />
      )}
    </>
  )
}

type Props = {
  isOpen: boolean
  onClose(): void
  usesWalletConnect: boolean // for now we assume that a walletconnect'ed wallet is generally a Safe
  account: PrefixedAddress
}
const AwaitingSignatureModal = ({
  isOpen,
  onClose,
  usesWalletConnect,
  account,
}: Props) => (
  <Modal
    isOpen={isOpen}
    style={modalStyle}
    contentLabel="Sign the batch transaction"
  >
    <div className="absolute right-0 top-0">
      <GhostButton iconOnly icon={X} onClick={onClose}>
        Cancel
      </GhostButton>
    </div>
    <p>Awaiting your signature ...</p>
    {usesWalletConnect && (
      <>
        <br />
        <p>
          <a
            className="inline-flex items-center gap-1 text-xs"
            href={`https://app.safe.global/${account}`}
            target="_blank"
            rel="noreferrer"
          >
            <SquareArrowOutUpRight size={16} />
            Open Pilot Safe
          </a>
        </p>
      </>
    )}
  </Modal>
)

Modal.setAppElement('#root')

const modalStyle: Styles = {
  overlay: {
    backgroundColor: 'rgb(35 34 17 / 52%)',
  },

  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    borderColor: '#d9d4ad',
    width: 300,
    borderRadius: 0,
    paddingTop: 30,
    background: 'rgb(84 83 62 / 71%)',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
}
