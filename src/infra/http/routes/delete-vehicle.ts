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
          id: z.coerce.number().optional(),
        }),
      },
    },
    async request => {
      const { idBase, placa, id } = request.body

      const data = await deleteVehicleFn(idBase, placa, id)

      return { success: true, data, message: data.message }
    }
  )
}
