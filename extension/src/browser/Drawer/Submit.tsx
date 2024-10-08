import React, { useState } from 'react'
import { RiCloseLine, RiExternalLinkLine } from 'react-icons/ri'
import Modal, { Styles } from 'react-modal'
import { toast } from 'react-toastify'

import { Button, IconButton } from '../../components'
import toastClasses from '../../components/Toast/Toast.module.css'
import { EXPLORER_URL, CHAIN_NAME } from '../../chains'
import { useRoute } from '../../routes'
import { JsonRpcError, ProviderType } from '../../types'
import {
  decodeGenericError,
  decodeRolesV1Error,
  decodeRolesV2Error,
} from '../../utils'
import { useSubmitTransactions } from '../ProvideProvider'
import { useTransactions } from '../../state'

import classes from './style.module.css'
import { getReadOnlyProvider } from '../../providers/readOnlyProvider'
import { usePushConnectionsRoute } from '../../routing'
import { parsePrefixedAddress, PrefixedAddress } from 'ser-kit'
import { waitForMultisigExecution } from '../../integrations/safe'

const Submit: React.FC = () => {
  const { route, chainId, connect, connected } = useRoute()
  const { initiator, providerType, avatar } = route
  const pushConnectionsRoute = usePushConnectionsRoute()

  const transactions = useTransactions()
  const submitTransactions = useSubmitTransactions()
  const [signaturePending, setSignaturePending] = useState(false)

  const connectWallet = () => {
    pushConnectionsRoute(route.id)
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
          <code>{name}</code>
        </>,
        { className: toastClasses.toastError }
      )
      return
    }
    setSignaturePending(false)

    const { txHash, safeTxHash } = result
    if (txHash) {
      console.log(
        `Transaction batch has been submitted with transaction hash ${txHash}`
      )
      const receipt =
        await getReadOnlyProvider(chainId).waitForTransaction(txHash)
      console.log(`Transaction ${txHash} has been executed`, receipt)

      toast(
        <>
          Transaction batch has been executed
          <a
            href={`${EXPLORER_URL[chainId]}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiExternalLinkLine />
            View in block explorer
          </a>
        </>
      )
    }

    if (safeTxHash) {
      console.log(
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
            <RiExternalLinkLine />
            {'View in Safe{Wallet}'}
          </a>
        </>
      )

      // In case the other safe owners are quick enough to sign while the Pilot session is still open, we can show a toast with an execution confirmation
      const txHash = await waitForMultisigExecution(chainId, safeTxHash)
      console.log(
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
            <RiExternalLinkLine />
            View in block explorer
          </a>
        </>
      )
    }
  }

  return (
    <>
      {(connected || !!connect) && (
        <Button
          onClick={submit}
          disabled={!submitTransactions || transactions.length === 0}
        >
          Submit
        </Button>
      )}

      {!connected && !connect && (
        <Button
          onClick={connectWallet}
          disabled={!submitTransactions || transactions.length === 0}
          secondary
        >
          Connect wallet to submit
        </Button>
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

export default Submit

const AwaitingSignatureModal: React.FC<{
  isOpen: boolean
  onClose(): void
  usesWalletConnect: boolean // for now we assume that a walletconnect'ed wallet is generally a Safe
  account: PrefixedAddress
}> = ({ isOpen, onClose, usesWalletConnect, account }) => (
  <Modal
    isOpen={isOpen}
    style={modalStyle}
    contentLabel="Sign the batch transaction"
  >
    <IconButton className={classes.modalClose} title="Cancel" onClick={onClose}>
      <RiCloseLine />
    </IconButton>
    <p>Awaiting your signature ...</p>
    {usesWalletConnect && (
      <>
        <br />
        <p>
          <a
            className={classes.safeAppLink}
            href={`https://app.safe.global/${account}`}
            target="_blank"
            rel="noreferrer"
          >
            <RiExternalLinkLine />
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
