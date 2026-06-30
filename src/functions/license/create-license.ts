import { prisma } from '@/lib/prisma'

interface CreateLicenseParams {
  userId: number
  deviceId: string
  androidVersion: string
  appVersion: string
  idBase: number
}

interface AppSubsRow {
  id: number
}

export async function createLicenseFn({
  userId,
  deviceId,
  androidVersion,
  appVersion,
  idBase,
}: CreateLicenseParams) {
  // Verifica na própria função se já existe registro para o par (user_id, device_id).
  const existing = await prisma.$queryRaw<AppSubsRow[]>`
    SELECT id
    FROM app_subs
    WHERE user_id = ${userId} AND device_id = ${deviceId}
    LIMIT 1
  `

  if (existing.length === 0) {
    await prisma.$queryRaw`
      INSERT INTO app_subs (user_id, device_id, android_version, app_version, id_base)
      VALUES (${userId}, ${deviceId}, ${androidVersion}, ${appVersion}, ${idBase})
    `

    return { created: true }
  }

  await prisma.$queryRaw`
    UPDATE app_subs
    SET last_access = NOW(), android_version = ${androidVersion}, app_version = ${appVersion}, id_base = ${idBase}
    WHERE user_id = ${userId} AND device_id = ${deviceId}
  `

  return { created: false }
}
