import { registerVehicleFn } from '@/functions/vehicles/register-vehicle'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const registerVehicle: FastifyPluginAsyncZod = async app => {
  app.post(
    '/register-vehicle',
    {
      schema: {
        tags: ['vehicles'],
        summary: 'Registrar veículo',
        description: 'Endpoint para cadastro de um novo veículo.',
        body: z.object({
          idBase: z.coerce.number(),
          tecnicoId: z.string(),
          placa: z.string(),
          nomeVeiculo: z.string(),
          km: z.coerce.number(),
        }),
      },
    },
    async (request, reply) => {
      const { idBase, tecnicoId, placa, nomeVeiculo, km } = request.body

      const data = await registerVehicleFn(
        idBase,
        tecnicoId,
        nomeVeiculo,
        placa,
        km
      )

      return reply.status(201).send({
        success: true,
        data,
        message: data.message,
      })
    }
  )
}
