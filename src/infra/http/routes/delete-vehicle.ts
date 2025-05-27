import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { deleteVehicleRepository } from '../../../repositories/vehicles/delete-vehicle-repository' // nome que usamos na função

// Rota para deletar um veículo da base de dados
export async function deleteVehicle(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/delete-vehicle',
    {
      schema: {
        body: z.object({
          idBase: z.coerce.number(),
          placa: z.string(),
        }),
      },
    },
    async request => {
      const { idBase, placa } = request.body

      const result = await deleteVehicleRepository(idBase, placa)

      return result
    }
  )
}
