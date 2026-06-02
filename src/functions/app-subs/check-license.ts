import { prisma } from '@/lib/prisma'
import { AppError } from '@/infra/http/error'

interface AppSubsRow {
  status: string
}

export async function checkLicenseFn(userId: number, deviceId: string) {
  const subs = await prisma.$queryRaw<AppSubsRow[]>`
    SELECT status
    FROM app_subs
    WHERE user_id = ${userId} AND device_id = ${deviceId}
    LIMIT 1
  `

  if (subs.length === 0) {
    throw new AppError('NOT_AUTHORIZED', 403)
  }

  const { status } = subs[0]

  if (status !== 'S') {
    throw new AppError('NOT_AUTHORIZED', 403)
  }

  return { authorized: true }
}
