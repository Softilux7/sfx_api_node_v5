import { registerExpoTokenFn } from '@/functions/notifications/register-expo-token'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const registerExpoToken: FastifyPluginAsyncZod = async app => {
  app.post(
    '/register-expo-token',
    {
      schema: {
        tags: ['notifications'],
        summary: 'Registrar token de notificação',
        description: 'Registra o token Expo Push para envio de notificações.',
        body: z.object({
          idEmpresa: z.number(),
          tecnicoId: z.string(),
          token: z.string(),
        }),
      },
    },
    async request => {
      const { idEmpresa, tecnicoId, token } = request.body

      const data = await registerExpoTokenFn(idEmpresa, tecnicoId, token)

      return { success: data.success, data, message: data.message }
    }
  )
}
