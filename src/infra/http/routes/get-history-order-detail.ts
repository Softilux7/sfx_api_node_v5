import { getOrdersHistoryDetailsFn } from '@/functions/orders/get-history-order-details'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getHistoryEquipmentsOrdersDetails: FastifyPluginAsyncZod =
  async app => {
    app.get(
      '/historico-equipamento-detalhes/:idBase/:sequence',
      {
        schema: {
          tags: ['orders'],
          summary: 'Detalhes do histórico de chamados do equipamento',
          description:
            'Endpoint para buscar os detalhes de um histórico de chamado relacionado a um equipamento.',
          params: z.object({
            idBase: z.coerce.number(),
            sequence: z.coerce.number(),
          }),
        },
      },
      async request => {
        const { idBase, sequence } = request.params

        const ordersHistoryDetails = await getOrdersHistoryDetailsFn(
          idBase,
          sequence
        )

        return {
          success: true,
          data: ordersHistoryDetails,
        }
      }
    )
  }
