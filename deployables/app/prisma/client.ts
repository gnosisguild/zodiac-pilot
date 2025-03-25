import { createRequire } from 'module'
import type { PrismaClient as Prisma } from './generated/client'

const require = createRequire(import.meta.url)

const { PrismaClient } = require('./generated/client')

export const prisma: Prisma = new PrismaClient()
