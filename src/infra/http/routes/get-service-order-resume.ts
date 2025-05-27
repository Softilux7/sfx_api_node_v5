import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getResumoChamadosRepository } from '../../../repositories/orders/get-service-order-resume'

// Rota de busca da quantidade de status de OS (*Dashboard grid)
export async function getResumoChamados(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/tecnicos/:tecnicoId/:idBase/resumo-chamados',
    {
      schema: {
        params: z.object({
          tecnicoId: z.string(),
          idBase: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { tecnicoId, idBase } = request.params

      const data = await getResumoChamadosRepository(tecnicoId, idBase)

      return { success: true, data }
    }
  )
}
