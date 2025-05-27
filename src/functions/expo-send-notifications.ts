import { Expo } from 'expo-server-sdk'

const expo = new Expo()

export async function sendPushNotification(
  pushTokens: string[],
  message: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data?: Record<string, any>
) {
  const messages = []

  for (const token of pushTokens) {
    if (!Expo.isExpoPushToken(token)) {
      console.error(`Push token ${token} is inválido`)
      continue
    }

    messages.push({
      to: token,
      sound: 'default',
      body: message,
      data: data || {},
    })
  }

  const chunks = expo.chunkPushNotifications(messages)
  const tickets = []

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
      tickets.push(...ticketChunk)
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
    }
  }

  return tickets
}
