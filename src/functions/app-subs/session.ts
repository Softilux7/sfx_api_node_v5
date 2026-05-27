import { prisma } from '@/lib/prisma'
import { AppError } from '@/infra/http/error'

interface SessionParams {
  userId: number
  deviceId: string
  androidVersion: string
  appVersion: string
}

interface AppSubsRow {
  status: string
}

export async function sessionFn({ userId, deviceId, androidVersion, appVersion }: SessionParams) {
  const subs = await prisma.$queryRaw<AppSubsRow[]>`
    SELECT status
    FROM app_subs
    WHERE user_id = ${userId} AND device_id = ${deviceId}
    LIMIT 1
  `

  if (subs.length === 0) {
    await prisma.$queryRaw`
      INSERT INTO app_subs (user_id, device_id, android_version, app_version)
      VALUES (${userId}, ${deviceId}, ${androidVersion}, ${appVersion})
    `
    return { authorized: true, status: 'S' }
  }

  const { status } = subs[0]

  if (status !== 'S') {
    throw new AppError('Acesso bloqueado para este dispositivo.', 403)
  }

  await prisma.$queryRaw`
    UPDATE app_subs
    SET last_access = NOW(), android_version = ${androidVersion}, app_version = ${appVersion}
    WHERE user_id = ${userId} AND device_id = ${deviceId}
  `

  return { authorized: true, status: 'S' }
}
