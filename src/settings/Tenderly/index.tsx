import classNames from 'classnames'
import React from 'react'

import { Box, Field, Flex } from '../../components'
import useTenderly, {
  TenderlyStatus,
  useSetTenderlySettings,
} from '../useTenderly'

import classes from './style.module.css'

const Tenderly: React.FC = () => {
  const [settings, status] = useTenderly()
  const setSettings = useSetTenderlySettings()

  return (
    <Flex direction="column" gap={2}>
      <h2>Simulate in Tenderly</h2>
      <Field label="User">
        <input
          type="text"
          value={settings.user}
          placeholder="Paste your Tenderly user name"
          onChange={(ev) => {
            setSettings({
              ...settings,
              user: ev.target.value,
            })
          }}
        />
      </Field>
      <Field label="Project">
        <input
          type="text"
          value={settings.project}
          placeholder="Paste the Tenderly project slug"
          onChange={(ev) => {
            setSettings({
              ...settings,
              project: ev.target.value,
            })
          }}
        />
      </Field>
      <Field label="Access key">
        <input
          type="text"
          value={settings.accessKey}
          placeholder="Create an access key in Tenderly"
          onChange={(ev) => {
            setSettings({
              ...settings,
              accessKey: ev.target.value,
            })
          }}
        />
      </Field>

      {status !== TenderlyStatus.SETTINGS_INCOMPLETE &&
        status !== TenderlyStatus.PENDING && (
          <Box
            p={3}
            className={classNames({
              [classes.error]: status !== TenderlyStatus.SUCCESS,
              [classes.success]: status === TenderlyStatus.SUCCESS,
            })}
          >
            {STATUS_MESSAGES[status]}
          </Box>
        )}
    </Flex>
  )
}

export default Tenderly

const STATUS_MESSAGES: Record<TenderlyStatus, string> = {
  [TenderlyStatus.SUCCESS]: 'Successfully connected to Tenderly',
  [TenderlyStatus.NOT_FOUND]:
    'The user or project could not be found in Tenderly',
  [TenderlyStatus.INVALID_ACCESS_KEY]: 'The Tenderly access key seems invalid',

  [TenderlyStatus.PENDING]: 'Trying to connect to Tenderly...',
  [TenderlyStatus.SETTINGS_INCOMPLETE]: 'Incomplete settings',
}
