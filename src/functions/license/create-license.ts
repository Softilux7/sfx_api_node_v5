import { prisma } from '@/lib/prisma'

interface CreateLicenseParams {
  userId: number
  deviceId: string
  androidVersion: string
  appVersion: string
  idBase: number
}

export async function createLicenseFn({
  userId,
  deviceId,
  androidVersion,
  appVersion,
  idBase,
}: CreateLicenseParams) {
  // Upsert atômico: garante 1 registro por (user_id, device_id) — depende do
  // índice UNIQUE idx_user_device. Sem condição de corrida em logins simultâneos.
  // affectedRows = 1 quando insere, 2 quando atualiza um registro existente.
  const affected = await prisma.$executeRaw`
    INSERT INTO app_subs (user_id, device_id, android_version, app_version, id_base)
    VALUES (${userId}, ${deviceId}, ${androidVersion}, ${appVersion}, ${idBase})
    ON DUPLICATE KEY UPDATE
      last_access = NOW(),
      android_version = VALUES(android_version),
      app_version = VALUES(app_version),
      id_base = VALUES(id_base)
  `

  return { created: affected === 1 }
}
