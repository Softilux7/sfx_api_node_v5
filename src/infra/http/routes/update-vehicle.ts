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
          'Atualiza a quilometragem. Aceita `id` (preferencial) ou a placa — a placa ' +
          'permanece porque a fila offline do app reenvia itens antigos, que não têm id.',
        body: z.object({
          idBase: z.coerce.number(),
          placa: z.string(),
          km: z.coerce.number(),
          id: z.coerce.number().optional(),
        }),
      },
    },
    async request => {
      const { idBase, placa, km, id } = request.body

      const data = await updateVehicleFn(idBase, placa, km, id)

      return { success: true, data, message: data.message }
    }
  )
}
