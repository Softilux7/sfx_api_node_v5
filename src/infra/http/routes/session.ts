import { sessionFn } from '@/functions/app-subs/session'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const sessionRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/session',
    {
      schema: {
        tags: ['app-auth'],
        summary: 'Sessão do app',
        description:
          'Verifica se o dispositivo está autorizado. Cria o registro na primeira vez (acesso liberado por padrão). Retorna 403 se o acesso foi bloqueado manualmente.',
        body: z.object({
          user_id: z.number().int(),
          device_id: z.string().min(1),
          android_version: z.string().min(1),
          app_version: z.string().min(1),
        }),
      },
    },
    async request => {
      const { user_id, device_id, android_version, app_version } = request.body

      const data = await sessionFn({
        userId: user_id,
        deviceId: device_id,
        androidVersion: android_version,
        appVersion: app_version,
      })

      return { authorized: data.authorized, status: data.status }
    }
  )
}
