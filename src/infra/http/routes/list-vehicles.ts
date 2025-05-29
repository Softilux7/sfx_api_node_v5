import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { listVehiclePlatesRepositorie } from '../../../repositories/vehicles/list-vehicles-repositorie'

// Rota de listagem dos veículos cadastrados
export async function listVehicles(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/vehicles/:idBase',
    {
      schema: {
        params: z.object({
          idBase: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idBase } = request.params

      const status = await listVehiclePlatesRepositorie(idBase)

      return status
    }
  )
}
