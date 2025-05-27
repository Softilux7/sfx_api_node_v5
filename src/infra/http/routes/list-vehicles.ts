import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { listVehiclePlatesRepositorie } from '../../../repositories/vehicles/list-vehicles-repositorie'

// Rota de listagem dos veículos cadastrados
export async function listVehicles(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/vehicles/:idBase/:placa/:nomeVeiculo',
    {
      schema: {
        params: z.object({
          idBase: z.coerce.number(),
          placa: z.string().optional(),
          nomeVeiculo: z.string().optional(),
        }),
      },
    },
    async request => {
      const { idBase, placa, nomeVeiculo } = request.params

      const status = await listVehiclePlatesRepositorie(
        idBase,
        placa,
        nomeVeiculo
      )

      return status
    }
  )
}
