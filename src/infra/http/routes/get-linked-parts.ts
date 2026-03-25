import { getLinkedPartsFn } from '@/functions/orders/get-linked-parts'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getParts: FastifyPluginAsyncZod = async app => {
  app.get(
    '/parts/:idBase/:seqos',
    {
      schema: {
        tags: ['orders'],
        summary: 'Peças vinculadas à O.S',
        description:
          'Endpoint para buscar as peças vinculadas a uma ordem de serviço.',
        params: z.object({
          idBase: z.coerce.number(),
          seqos: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idBase, seqos } = request.params

      const status = await getLinkedPartsFn(idBase, seqos)

      return status
    }
  )
}
