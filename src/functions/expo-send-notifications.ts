import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export async function sendPushNotification(pushTokens: string[], message: string, data?: Record<string, any>) {
  let messages = [];

  for (let token of pushTokens) {
    if (!Expo.isExpoPushToken(token)) {
      console.error(`Push token ${token} is inválido`);
      continue;
    }

    messages.push({
      to: token,
      sound: 'default',
      body: message,
      data: data || {},
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }

  return tickets;
}
