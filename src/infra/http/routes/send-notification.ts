import { sendNotificationFn } from '@/functions/notifications/send-notification'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const sendNotificationRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/send-notification',
    {
      schema: {
        tags: ['notifications'],
        summary: 'Enviar notificação push',
        description: 'Envia uma notificação push para o técnico via Expo.',
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

      const result = await sendNotificationFn(
        idEmpresa,
        tecnicoId,
        message,
        data
      )

      return { success: result.success, data: result }
    }
  )
}
