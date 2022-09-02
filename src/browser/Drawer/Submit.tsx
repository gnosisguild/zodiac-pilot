import { providers } from 'ethers'
import React, { useState } from 'react'
import { RiCloseLine, RiExternalLinkLine } from 'react-icons/ri'
import Modal from 'react-modal'
import { toast } from 'react-toastify'

import { Button, IconButton } from '../../components'
import { ChainId, EXPLORER_URL, NETWORK_PREFIX } from '../../networks'
import { waitForMultisigExecution } from '../../providers'
import { useConnection } from '../../settings'
import { useSubmitTransactions } from '../ProvideProvider'
import { useDispatch, useNewTransactions } from '../state'

import classes from './style.module.css'

const Submit: React.FC = () => {
  const { provider: walletConnectProvider } = useConnection()
  const dispatch = useDispatch()

  const transactions = useNewTransactions()
  const submitTransactions = useSubmitTransactions()
  const [signaturePending, setSignaturePending] = useState(false)

  const submit = async () => {
    if (!submitTransactions) throw new Error('invariant violation')
    setSignaturePending(true)
    const batchTransactionHash = await submitTransactions()
    setSignaturePending(false)

    // wait for transaction to be mined
    const realBatchTransactionHash = await waitForMultisigExecution(
      walletConnectProvider,
      batchTransactionHash
    )
    console.log(
      `Transaction batch ${batchTransactionHash} has been executed with transaction hash ${realBatchTransactionHash}`
    )
    const receipt = await new providers.Web3Provider(
      walletConnectProvider
    ).waitForTransaction(realBatchTransactionHash)
    console.log(
      `Transaction ${realBatchTransactionHash} has been mined`,
      receipt
    )

    dispatch({
      type: 'CLEAR_TRANSACTIONS',
      payload: { batchTransactionHash },
    })

    // TODO: show Toast message with Blockchain Explorer link
    toast(
      <>
        Transaction batch has been executed
        <br />
        <a
          href={`${
            EXPLORER_URL[walletConnectProvider.chainId as ChainId]
          }/tx/${realBatchTransactionHash}`}
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
      <Button
        onClick={submit}
        disabled={!submitTransactions || transactions.length === 0}
      >
        Submit
      </Button>
      {signaturePending && (
        <Modal
          isOpen={signaturePending}
          style={modalStyle}
          contentLabel="Sign the batch transaction"
        >
          <IconButton
            className={classes.modalClose}
            title="Cancel"
            onClick={() => {
              setSignaturePending(false)
            }}
          >
            <RiCloseLine />
          </IconButton>
          <p>Awaiting your signature ...</p>
          <br />
          <p>
            <a
              className={classes.safeAppLink}
              href={`https://gnosis-safe.io/app/${
                NETWORK_PREFIX[walletConnectProvider.chainId as ChainId]
              }:${
                walletConnectProvider.accounts[0]
              }/apps?appUrl=https://apps.gnosis-safe.io/wallet-connect`}
              target="_blank"
              rel="noreferrer"
            >
              <RiExternalLinkLine />
              WalletConnect Safe app
            </a>
          </p>
        </Modal>
      )}
    </>
  )
}

export default Submit

Modal.setAppElement('#root')

const modalStyle = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },

  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    width: 300,
    borderRadius: 0,
    paddingTop: 30,
    background:
      'linear-gradient(108.86deg, rgba(26, 33, 66, 1) 6.24%, rgba(12, 19, 8, 1) 53.08%, rgba(37, 6, 4, 1) 96.54%)',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
}
