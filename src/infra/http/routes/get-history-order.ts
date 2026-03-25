import { getOrdersHistoryFn } from '@/functions/orders/get-history-order'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getHistoryEquipmentsOrders: FastifyPluginAsyncZod = async app => {
  app.get(
    '/historico-equipamento/:idBase/:cdequipamento',
    {
      schema: {
        tags: ['orders'],
        summary: 'Histórico de chamados do equipamento',
        description:
          'Endpoint para buscar o histórico de chamados vinculados a um equipamento.',
        params: z.object({
          idBase: z.coerce.number(),
          cdequipamento: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idBase, cdequipamento } = request.params

      const ordersHistory = await getOrdersHistoryFn(idBase, cdequipamento)

      return {
        success: true,
        data: ordersHistory,
      }
    }
  )
}
