import { KnownContracts } from '@gnosis.pm/zodiac'

export const MODULE_NAMES = {
  [KnownContracts.DELAY]: 'Delay',
  [KnownContracts.ROLES_V1]: 'Roles v1',
  [KnownContracts.ROLES_V2]: 'Roles v2',
}

// we use a port to communicate between the panel app and the background script as this allows us to track when the panel is closed
export const PILOT_PANEL_PORT = 'PILOT_PANEL_PORT'
