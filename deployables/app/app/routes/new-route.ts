import { editRoute } from '@/utils'
import { createBlankRoute } from '@zodiac/modules'

export const loader = () => editRoute(createBlankRoute())
