import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { listEquipmentsRepository } from '../../../repositories/equipments/list-equipments-repositorie'

// Rota para buscar equipamentos da empresa com filtros opcionais
export async function listEquipments(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/equipments/search',
    {
      schema: {
        body: z.object({
          idBase: z.coerce.number(),
          cdequipamento: z.coerce.number().optional(),
          nmcliente: z.string().optional(),
          contrato: z.enum(['with', 'without', '']).optional().default(''),
          patrimonio: z.string().optional(),
          serie: z.string().optional(),
          limit: z.coerce.number().int().min(1).default(30),
        }),
      },
    },

    async request => {
      const equipamentos = await listEquipmentsRepository(request.body)

      return {
        success: true,
        message:
          equipamentos.length > 0
            ? 'Equipamentos encontrados'
            : 'Nenhum equipamento encontrado',
        equipamentos,
      }
    }
  )
}
