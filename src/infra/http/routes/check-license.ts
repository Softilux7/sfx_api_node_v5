import { checkLicenseFn } from '@/functions/app-subs/check-license'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const checkLicenseRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/license/check',
    {
      schema: {
        tags: ['app-auth'],
        summary: 'Verificar licença',
        description: 'Verifica se o dispositivo possui licença ativa. Retorna 403 com código NOT_AUTHORIZED se bloqueado ou não registrado.',
        querystring: z.object({
          user_id: z.coerce.number().int(),
          device_id: z.string().min(1),
        }),
      },
    },
    async request => {
      const { user_id, device_id } = request.query

      const data = await checkLicenseFn(user_id, device_id)

      return { authorized: data.authorized, code: 'AUTHORIZED' }
    }
  )
}
