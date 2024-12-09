import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getTypeCounters } from '../repositories/get-type-counters-repositorie'

export async function listTypeCounters(app: FastifyInstance) {
  app
  .withTypeProvider<ZodTypeProvider>()
  .get('/tecnicos/:idBase/:cdEquipamento/lista-tipo-medidor-contrato',
    {
      schema: {
        params: z.object({       
          idBase: z.coerce.number(),
          cdEquipamento: z.coerce.number(),
        }),
      },
    },

    async (request) => {
      const { idBase, cdEquipamento } = request.params

      // Usa a função de serviço para obter as medidores
      const counters = await getTypeCounters(idBase, cdEquipamento);

      return { success: true, data: {counters: counters.join(',') } };
    },
  )
}
