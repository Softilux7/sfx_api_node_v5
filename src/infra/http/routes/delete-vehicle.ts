import { deleteVehicleFn } from '@/functions/vehicles/delete-vehicle'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const deleteVehicle: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/delete-vehicle',
    {
      schema: {
        tags: ['vehicles'],
        summary: 'Deletar veículo',
        description: 'Endpoint para remoção de um veículo cadastrado.',
        body: z.object({
          idBase: z.coerce.number(),
          placa: z.string(),
        }),
      },
    },
    async request => {
      const { idBase, placa } = request.body

      const data = await deleteVehicleFn(idBase, placa)

      return { success: true, data, message: data.message }
    }
  )
}
