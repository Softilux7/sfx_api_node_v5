import { getTypeCountersFn } from '@/functions/equipments/get-type-counters'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const listTypeCounters: FastifyPluginAsyncZod = async app => {
  app.get(
    '/tecnicos/:idBase/:cdEquipamento/lista-tipo-medidor-contrato',
    {
      schema: {
        tags: ['equipments'],
        summary: 'Listar tipos de medidores do equipamento',
        description:
          'Endpoint para buscar os tipos de medidores vinculados ao contrato de um equipamento.',
        params: z.object({
          idBase: z.coerce.number(),
          cdEquipamento: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idBase, cdEquipamento } = request.params

      const counters = await getTypeCountersFn(idBase, cdEquipamento)

      return {
        success: true,
        data: {
          counters: counters.join(','),
        },
      }
    }
  )
}
