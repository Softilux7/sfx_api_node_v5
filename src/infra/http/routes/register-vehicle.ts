import { DuplicatePlateError } from '@/functions/vehicles/duplicate-plate'
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
        description:
          'Cadastra um veículo. `tecnicoId` nulo cria um veículo da empresa, ' +
          'visível para todos os técnicos da base.',
        body: z.object({
          idBase: z.coerce.number(),
          tecnicoId: z.string().nullable().optional(),
          placa: z.string(),
          nomeVeiculo: z.string(),
          km: z.coerce.number(),
        }),
      },
    },
    async (request, reply) => {
      const { idBase, tecnicoId, placa, nomeVeiculo, km } = request.body

      try {
        const data = await registerVehicleFn(
          idBase,
          tecnicoId ?? null,
          nomeVeiculo,
          placa,
          km
        )

        return reply.status(201).send({
          success: true,
          data,
          message: data.message,
        })
      } catch (error) {
        if (error instanceof DuplicatePlateError) {
          return reply.status(409).send({ success: false, message: error.message })
        }
        throw error
      }
    }
  )
}
