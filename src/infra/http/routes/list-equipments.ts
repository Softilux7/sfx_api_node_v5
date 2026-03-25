import { listEquipmentsFn } from '@/functions/equipments/list-equipments'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const listEquipments: FastifyPluginAsyncZod = async app => {
  app.post(
    '/equipments/search',
    {
      schema: {
        tags: ['equipments'],
        summary: 'Buscar equipamentos',
        description: 'Busca equipamentos da empresa com filtros opcionais.',
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
      const data = await listEquipmentsFn(request.body)

      return {
        success: true,
        data,
        message:
          data.length > 0
            ? 'Equipamentos encontrados'
            : 'Nenhum equipamento encontrado',
      }
    }
  )
}
