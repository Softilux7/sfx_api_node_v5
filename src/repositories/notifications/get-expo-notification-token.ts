import { sendPushNotification } from '../../functions/expo-send-notifications'
import { prisma } from '../../lib/prisma'

export async function sendNotificationRepository(
  idEmpresa: number,
  tecnicoId: string,
  message: string,
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  data: {}
) {
  // Busca os tokens de notificação dos usuários da empresa
  const users = await prisma.$queryRaw<
    { id: number; token: string; tecnico_id: string }[]
  >`
    SELECT id, token, tecnico_id FROM users WHERE empresa_id = ${idEmpresa} AND tecnico_id = ${tecnicoId} LIMIT 1
  `

  // Verifica se encontrou algum usuário
  if (users.length === 0) {
    return {
      success: false,
      message: 'Nenhum usuário encontrado para essa empresa e técnico',
    }
  }

  // Extrai o token do primeiro usuário encontrado
  const pushTokens = users.map(user => user.token).filter(Boolean)

  if (pushTokens.length === 0) {
    return {
      success: false,
      message: 'Usuário encontrado, mas sem token válido',
    }
  }

  // Envia as notificações
  const response = await sendPushNotification(pushTokens, message, data)

  return { success: true, tickets: response }
}
