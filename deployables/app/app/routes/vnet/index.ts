import type { ActionFunctionArgs } from 'react-router'
import { createVnet } from '../../vnet/server/createVnet'

export async function action({ request }: ActionFunctionArgs) {
  return await createVnet(await request.json())
}
