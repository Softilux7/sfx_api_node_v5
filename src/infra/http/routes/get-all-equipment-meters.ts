import { listAllEquipmentMetersFn } from '@/functions/equipments/get-all-equipment-meters'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getAllEquipmentMeters: FastifyPluginAsyncZod = async app => {
  app.get(
    '/equipment-meters/:idBase/:cdEquipamento',
    {
      schema: {
        tags: ['equipments'],
        summary: 'Buscar medidores do equipamento',
        description:
          'Retorna todos os medidores cadastrados para o equipamento.',
        params: z.object({
          idBase: z.coerce.number(),
          cdEquipamento: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idBase, cdEquipamento } = request.params

      const data = await listAllEquipmentMetersFn(idBase, cdEquipamento)

      return { success: true, data }
    }
  )
}
