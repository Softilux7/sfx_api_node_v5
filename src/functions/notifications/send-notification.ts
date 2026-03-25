import { prisma } from '@/lib/prisma'
import { sendPushNotification } from './send-push-notification'

export async function sendNotificationFn(
  idEmpresa: number,
  tecnicoId: string,
  message: string,
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  data: {}
) {
  const users = await prisma.$queryRaw<
    { id: number; token: string; tecnico_id: string }[]
  >`
    SELECT id, token, tecnico_id FROM users WHERE empresa_id = ${idEmpresa} AND tecnico_id = ${tecnicoId} LIMIT 1
  `

  if (users.length === 0) {
    return {
      success: false,
      message: 'Nenhum usuário encontrado para essa empresa e técnico',
    }
  }

  const pushTokens = users.map(user => user.token).filter(Boolean)

  if (pushTokens.length === 0) {
    return {
      success: false,
      message: 'Usuário encontrado, mas sem token válido',
    }
  }

  const response = await sendPushNotification(pushTokens, message, data)

  return { success: true, tickets: response }
}
