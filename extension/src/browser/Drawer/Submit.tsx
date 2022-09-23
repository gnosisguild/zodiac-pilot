import { providers } from 'ethers'
import React, { useState } from 'react'
import { RiCloseLine, RiExternalLinkLine } from 'react-icons/ri'
import Modal, { Styles } from 'react-modal'
import { toast } from 'react-toastify'

import { Button, IconButton } from '../../components'
import { EXPLORER_URL, NETWORK_PREFIX } from '../../networks'
import { waitForMultisigExecution } from '../../providers'
import { useConnection } from '../../settings'
import { ProviderType } from '../../types'
import { useSubmitTransactions } from '../ProvideProvider'
import { useDispatch, useNewTransactions } from '../state'

import classes from './style.module.css'

const Submit: React.FC = () => {
  const {
    provider,
    connection: { chainId, pilotAddress, providerType },
  } = useConnection()
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
      provider,
      chainId,
      batchTransactionHash
    )
    console.log(
      `Transaction batch ${batchTransactionHash} has been executed with transaction hash ${realBatchTransactionHash}`
    )
    const receipt = await new providers.Web3Provider(
      provider
    ).waitForTransaction(realBatchTransactionHash)
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
        <br />
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
          {providerType === ProviderType.WalletConnect && (
            <>
              <br />
              <p>
                <a
                  className={classes.safeAppLink}
                  href={`https://gnosis-safe.io/app/${NETWORK_PREFIX[chainId]}:${pilotAddress}/apps?appUrl=https://apps.gnosis-safe.io/wallet-connect`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <RiExternalLinkLine />
                  WalletConnect Safe app
                </a>
              </p>
            </>
          )}
        </Modal>
      )}
    </>
  )
}

export default Submit

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
