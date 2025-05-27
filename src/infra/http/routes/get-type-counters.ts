import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getTypeCounters } from '../../../repositories/equipments/get-type-counters-repositorie'

// Rota de busca para os tipos de medidores do equipamento
export async function listTypeCounters(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/tecnicos/:idBase/:cdEquipamento/lista-tipo-medidor-contrato',
    {
      schema: {
        params: z.object({
          idBase: z.coerce.number(),
          cdEquipamento: z.coerce.number(),
        }),
      },
    },

    async request => {
      const { idBase, cdEquipamento } = request.params

      const counters = await getTypeCounters(idBase, cdEquipamento)

      return { success: true, data: { counters: counters.join(',') } }
    }
  )
}
