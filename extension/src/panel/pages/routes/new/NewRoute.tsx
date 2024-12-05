import { Breadcrumbs, Page, PrimaryButton, TextInput } from '@/components'
import { useCreateExecutionRoute } from '@/execution-routes'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChainId } from 'ser-kit'
import { ChainSelect } from '../ChainSelect'

export const NewRoute = () => {
  const [label, setLabel] = useState('')
  const [chainId, setChainId] = useState<ChainId | undefined>(undefined)

  const createRoute = useCreateExecutionRoute()
  const navigate = useNavigate()

  return (
    <Page>
      <Page.Header>
        <Breadcrumbs>
          <Breadcrumbs.Entry to="/">Transactions</Breadcrumbs.Entry>
          <Breadcrumbs.Entry to="/routes">All routes</Breadcrumbs.Entry>
        </Breadcrumbs>

        <Page.Title>{label || 'New route'}</Page.Title>
      </Page.Header>

      <Page.Content>
        <TextInput
          label="Route label"
          value={label}
          placeholder="New route"
          onChange={(event) => setLabel(event.target.value)}
        />

        <ChainSelect value={chainId} onChange={setChainId} />
      </Page.Content>

      <Page.Footer>
        <PrimaryButton
          onClick={() => {
            createRoute({ label, chainId })

            navigate('/')
          }}
        >
          Save & Launch
        </PrimaryButton>
      </Page.Footer>
    </Page>
  )
}
