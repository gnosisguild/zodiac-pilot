import { prisma } from '@/db'

export const loader = async () => {
  await prisma.$connect()

  return 'OK'
}
