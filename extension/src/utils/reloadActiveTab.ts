import { getActiveTab } from './getActiveTab'
import { reloadTab } from './reloadTab'

export const reloadActiveTab = async () => {
  const tab = await getActiveTab()

  if (tab.id != null) {
    reloadTab(tab.id)
  }
}
