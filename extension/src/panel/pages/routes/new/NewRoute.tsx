import { Page, TextInput } from '@/components'
import { useState } from 'react'

export const NewRoute = () => {
  const [label, setLabel] = useState('')

  return (
    <Page>
      <Page.Header>
        <Page.Title>{label || 'New route'}</Page.Title>
      </Page.Header>

      <Page.Content>
        <TextInput
          label="Route label"
          value={label}
          placeholder="New route"
          onChange={(event) => setLabel(event.target.value)}
        />
      </Page.Content>
    </Page>
  )
}
