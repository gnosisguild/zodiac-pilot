import React, { useState } from 'react'
import { RiCloseLine, RiExternalLinkLine } from 'react-icons/ri'
import Modal, { Styles } from 'react-modal'
import { toast } from 'react-toastify'

import { Button, IconButton } from '../../components'
import toastClasses from '../../components/Toast/Toast.module.css'
import { ChainId, EXPLORER_URL, CHAIN_PREFIX, CHAIN_NAME } from '../../chains'
import { waitForMultisigExecution } from '../../providers'
// import { shallExecuteDirectly } from '../../safe/sendTransaction'
import { useConnection } from '../../connections'
import { JsonRpcError, ProviderType } from '../../types'
import {
  decodeGenericError,
  decodeRolesV1Error,
  decodeRolesV2Error,
} from '../../utils'
import { useSubmitTransactions } from '../ProvideProvider'
import { useDispatch, useNewTransactions } from '../state'

import classes from './style.module.css'
import { getReadOnlyProvider } from '../../providers/readOnlyProvider'
import { usePushConnectionsRoute } from '../../routing'

const Submit: React.FC = () => {
  const { connection, connect, connected } = useConnection()
  const { chainId, pilotAddress, providerType } = connection
  const dispatch = useDispatch()
  const pushConnectionsRoute = usePushConnectionsRoute()

  const transactions = useNewTransactions()
  const submitTransactions = useSubmitTransactions()
  const [signaturePending, setSignaturePending] = useState(false)
  // const [executesDirectly, setExecutesDirectly] = useState(false)

  // useEffect(() => {
  //   let canceled = false
  //   shallExecuteDirectly(provider, connection).then((executesDirectly) => {
  //     if (!canceled) setExecutesDirectly(executesDirectly)
  //   })
  //   return () => {
  //     canceled = true
  //   }
  // }, [provider, connection])

  const connectWallet = () => {
    pushConnectionsRoute(connection.id)
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
    let batchTransactionHash: string
    try {
      batchTransactionHash = await submitTransactions()
    } catch (e) {
      console.warn(e)
      setSignaturePending(false)
      const err = e as JsonRpcError

      const { message } = decodeRolesV1Error(err) ||
        decodeRolesV2Error(err) || { message: decodeGenericError(err) }
      toast.error(
        <>
          <p>Submitting the transaction batch failed:</p>
          <br />
          <code>{message}</code>
        </>,
        { className: toastClasses.toastError }
      )
      return
    }
    setSignaturePending(false)

    // wait for transaction to be mined
    const realBatchTransactionHash = await waitForMultisigExecution(
      chainId,
      batchTransactionHash
    )
    console.log(
      `Transaction batch ${batchTransactionHash} has been executed with transaction hash ${realBatchTransactionHash}`
    )
    const receipt = await getReadOnlyProvider(chainId).waitForTransaction(
      realBatchTransactionHash
    )
    console.log(
      `Transaction ${realBatchTransactionHash} has been mined`,
      receipt
    )

    dispatch({
      type: 'CLEAR_TRANSACTIONS',
      payload: { batchTransactionHash },
    })

    toast(
      <>
        Transaction batch has been executed
        <a
          href={`${EXPLORER_URL[chainId]}/tx/${realBatchTransactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <RiExternalLinkLine />
          View on block explorer
        </a>
      </>
    )
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

      {signaturePending && (
        <AwaitingSignatureModal
          isOpen={signaturePending}
          onClose={() => setSignaturePending(false)}
          usesWalletConnect={providerType === ProviderType.WalletConnect}
          chainId={chainId}
          pilotAddress={pilotAddress}
        />
      )}

      {/* {signaturePending && executesDirectly && (
        <AwaitingMultisigExecutionModal
          isOpen={signaturePending}
          onClose={() => setSignaturePending(false)}
          chainId={chainId}
          avatarAddress={avatarAddress}
        />
      )} */}
    </>
  )
}

export default Submit

const AwaitingSignatureModal: React.FC<{
  isOpen: boolean
  onClose(): void
  usesWalletConnect: boolean // for now we assume that a walletconnect'ed wallet is generally a Safe
  chainId: ChainId
  pilotAddress: string
}> = ({ isOpen, onClose, usesWalletConnect, chainId, pilotAddress }) => (
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
            href={`https://app.safe.global/${CHAIN_PREFIX[chainId]}:${pilotAddress}`}
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

// const AwaitingMultisigExecutionModal: React.FC<{
//   isOpen: boolean
//   onClose(): void
//   chainId: ChainId
//   avatarAddress: string
// }> = ({ isOpen, onClose, chainId, avatarAddress }) => (
//   <Modal
//     isOpen={isOpen}
//     style={modalStyle}
//     contentLabel="Sign the batch transaction"
//   >
//     <IconButton className={classes.modalClose} title="Cancel" onClick={onClose}>
//       <RiCloseLine />
//     </IconButton>
//     <p>Awaiting execution of Safe transaction ...</p>

//     <br />
//     <p>
//       <a
//         className={classes.safeAppLink}
//         href={`https://app.safe.global/${NETWORK_PREFIX[chainId]}:${avatarAddress}/transactions/queue`}
//         target="_blank"
//         rel="noreferrer"
//       >
//         <RiExternalLinkLine />
//         Collect signatures and trigger execution
//       </a>
//     </p>
//   </Modal>
// )

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
