import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { getAllOrdersRepository } from '../../../repositories/orders/get-all-order.repository'

// Rota de busca por O.S do técnico (POST)
export async function getAllServiceOrderTechnical(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/tecnico/todos-chamados-tecnico',
    {
      schema: {
        body: z.object({
          idTecnico: z.string(),
          idBase: z.coerce.number(),
          status: z.string(),
          seqos: z.coerce.number().optional(),
          portalId: z.coerce.number().optional(),
          serie: z.string().optional(),
          patrimonio: z.string().optional(),
        }),
      },
    },
    async request => {
      const { idTecnico, idBase, status, seqos, portalId, serie, patrimonio } =
        request.body

      const data = await getAllOrdersRepository(idTecnico, idBase, status, {
        seqos,
        portalId,
        serie,
        patrimonio,
      })

      return { success: true, chamados: data }
    }
  )
}
