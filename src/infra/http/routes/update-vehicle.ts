import { updateVehicleFn } from '@/functions/vehicles/update-vehicle'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const updateVehicle: FastifyPluginAsyncZod = async app => {
  app.put(
    '/update-vehicle',
    {
      schema: {
        tags: ['vehicles'],
        summary: 'Atualizar quilometragem do veículo',
        description:
          'Endpoint para atualização da quilometragem de um veículo.',
        body: z.object({
          idBase: z.coerce.number(),
          placa: z.string(),
          km: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idBase, placa, km } = request.body

      const data = await updateVehicleFn(idBase, placa, km)

      return { success: true, data, message: data.message }
    }
  )
}
