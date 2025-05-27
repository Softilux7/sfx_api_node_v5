import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { listAllEquipmentMeters } from '../../../repositories/equipments/get-all-equipment-meters-repositorie'

// Faz uma busca pelos medidores dos equipamentos (*Modal de medidores formulário)
export async function getAllEquipmentMeters(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/equipment-meters/:idBase/:cdEquipamento',
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

      const meters = await listAllEquipmentMeters(idBase, cdEquipamento)

      return { success: true, message: 'Medidores encontrados', meters }
    }
  )
}
