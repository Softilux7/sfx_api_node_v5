import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { updateVehicleRepository } from '../../../repositories/vehicles/update-vehicle-repository'

// Rota de atualização de dados do veículo
export async function updateVehicle(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/update-vehicle',
    {
      schema: {
        body: z.object({
          idBase: z.coerce.number(),
          placa: z.string(),
          km: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idBase, placa, km } = request.body

      const result = await updateVehicleRepository(idBase, placa, km)

      return result
    }
  )
}
