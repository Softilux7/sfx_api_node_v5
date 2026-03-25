import { getAllOrdersFn } from '@/functions/orders/get-all-orders'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getAllServiceOrderTechnical: FastifyPluginAsyncZod = async app => {
  app.post(
    '/tecnico/todos-chamados-tecnico',
    {
      schema: {
        tags: ['orders'],
        summary: 'Listar chamados do técnico',
        description:
          'Endpoint para buscar todos os chamados vinculados a um técnico, com possibilidade de filtros.',
        body: z.object({
          idTecnico: z.string(),
          idBase: z.coerce.number(),
          status: z.string(),
          seqos: z.coerce.number().optional(),
          portalId: z.coerce.number().optional(),
          serie: z.string().optional(),
          patrimonio: z.string().optional(),
          orderByRota: z.boolean().optional().default(false),
        }),
      },
    },
    async request => {
      const {
        idTecnico,
        idBase,
        status,
        seqos,
        portalId,
        serie,
        patrimonio,
        orderByRota,
      } = request.body

      const data = await getAllOrdersFn(idTecnico, idBase, status, {
        seqos,
        portalId,
        serie,
        patrimonio,
        orderByRota,
      })

      return {
        success: true,
        chamados: data,
      }
    }
  )
}
