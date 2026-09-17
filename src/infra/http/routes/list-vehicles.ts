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
        description:
          'Retorna os veículos da base. Com `tecnicoId`, devolve os da empresa ' +
          '(TECNICO_ID nulo) mais os pessoais daquele técnico; sem ele, devolve todos.',
        params: z.object({
          idBase: z.coerce.number(),
        }),
        querystring: z.object({
          tecnicoId: z.string().optional(),
        }),
      },
    },
    async request => {
      const { idBase } = request.params
      const { tecnicoId } = request.query

      const data = await listVehiclesFn(idBase, tecnicoId)

      return { success: true, data }
    }
  )
}
