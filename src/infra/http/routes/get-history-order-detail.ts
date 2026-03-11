import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getOrdersHistoryDetails } from '../../../repositories/orders/get-history-order-details-repositorie'

// Rota de busca por detalhes de um histórico de chamado do equipamento
export async function getHistoryEquipmentsOrdersDetails(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/historico-equipamento-detalhes/:idBase/:sequence',
    {
      schema: {
        params: z.object({
          idBase: z.coerce.number(),
          sequence: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idBase, sequence } = request.params

      const ordersHistoryDetails = await getOrdersHistoryDetails(
        idBase,
        sequence
      )

      return { success: true, data: ordersHistoryDetails }
    }
  )
}
