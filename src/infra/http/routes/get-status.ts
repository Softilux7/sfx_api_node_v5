import { getStatusFn } from '@/functions/orders/get-status'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getStatus: FastifyPluginAsyncZod = async app => {
  app.get(
    '/status/:idEmpresa',
    {
      schema: {
        tags: ['orders'],
        summary: 'Listar status da empresa',
        description:
          'Endpoint para buscar os status disponíveis de ordens de serviço de uma empresa.',
        params: z.object({
          idEmpresa: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idEmpresa } = request.params

      const status = await getStatusFn(idEmpresa)

      return status
    }
  )
}
