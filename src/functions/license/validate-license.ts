import { prisma } from '@/lib/prisma'
import { AppError } from '@/infra/http/error'

interface ValidateLicenseParams {
  userId: number
  deviceId?: string
  androidVersion?: string
  appVersion?: string
  lastAccess?: Date
}

interface UserLicenseRow {
  app_license: string | null
}

interface AppSubsRow {
  id: number
}

export async function validateLicenseFn({
  userId,
  deviceId,
  androidVersion,
  appVersion,
  lastAccess,
}: ValidateLicenseParams) {
  const [user] = await prisma.$queryRaw<UserLicenseRow[]>`
    SELECT app_license FROM users WHERE id = ${userId} LIMIT 1
  `

  if (!user || user.app_license !== 'S') {
    throw new AppError('NOT_AUTHORIZED', 403)
  }

  // Quando o device é informado, exige que já exista registro em app_subs.
  // Sem registro = sessão inválida (NOT_AUTHORIZED) — a criação fica só no /license.
  if (deviceId) {
    const subs = await prisma.$queryRaw<AppSubsRow[]>`
      SELECT id
      FROM app_subs
      WHERE user_id = ${userId} AND device_id = ${deviceId}
      LIMIT 1
    `

    if (subs.length === 0) {
      throw new AppError('DEVICE_NOT_REGISTERED', 403)
    }

    // Registra o acesso e atualiza as versões (mantém o valor atual quando não enviado).
    await prisma.$queryRaw`
      UPDATE app_subs
      SET
        last_access = ${lastAccess ?? new Date()},
        android_version = COALESCE(${androidVersion ?? null}, android_version),
        app_version = COALESCE(${appVersion ?? null}, app_version)
      WHERE user_id = ${userId} AND device_id = ${deviceId}
    `
  }

  return { authorized: true }
}
