import { type Prisma, PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// Acima disso a query aparece no log do PM2: hoje só os erros apareciam e lentidão era invisível.
const SLOW_QUERY_MS = 1000

function createClient() {
  const client = new PrismaClient({
    log: [
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'warn' },
      { emit: 'event', level: 'query' },
    ],
  })

  client.$on('query', event => {
    if (event.duration >= SLOW_QUERY_MS) {
      console.warn(
        `[prisma] query lenta (${event.duration} ms): ${event.query.slice(0, 500)}`
      )
    }
  })

  return client
}

export const prisma = global.__prisma || createClient()

/** Client normal ou o de uma `$transaction` interativa: funções que participam de transação recebem este tipo. */
export type Db = PrismaClient | Prisma.TransactionClient

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}
