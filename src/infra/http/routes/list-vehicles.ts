import { listVehiclesFn } from '@/functions/vehicles/list-vehicles'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const listVehicles: FastifyPluginAsyncZod = async app => {
  app.get(
    '/vehicles/:idBase',
    {
      schema: {
        tags: ['vehicles'],
        summary: 'Listar veículos',
        description: 'Retorna todos os veículos cadastrados para a base.',
        params: z.object({
          idBase: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idBase } = request.params

      const data = await listVehiclesFn(idBase)

      return { success: true, data }
    }
  )
}
