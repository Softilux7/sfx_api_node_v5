import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { sendNotificationRepository } from '../../../repositories/notifications/get-expo-notification-token'

// Rota de envio de notificações
export async function sendNotificationRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/send-notification',
    {
      schema: {
        body: z.object({
          idEmpresa: z.number(),
          message: z.string(),
          tecnicoId: z.string(),
          data: z.object({}),
        }),
      },
    },
    async request => {
      const { idEmpresa, message, data, tecnicoId } = request.body

      const result = await sendNotificationRepository(
        idEmpresa,
        tecnicoId,
        message,
        data
      )

      return result
    }
  )
}
