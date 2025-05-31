import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getLinkedParts } from '../../../repositories/orders/get-linked-parts-repositorie'

export async function getParts(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/parts/:idBase/:seqos',
    {
      schema: {
        params: z.object({
          idBase: z.coerce.number(),
          seqos: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idBase, seqos } = request.params

      const status = await getLinkedParts(idBase, seqos)

      return status
    }
  )
}
