import { DuplicatePlateError } from '@/functions/vehicles/duplicate-plate'
import { updateVehicleDataFn } from '@/functions/vehicles/update-vehicle-data'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const updateVehicleData: FastifyPluginAsyncZod = async app => {
  app.put(
    '/update-vehicle-data',
    {
      schema: {
        tags: ['vehicles'],
        summary: 'Atualizar dados do veículo',
        description:
          'Edita nome, placa e dono do veículo. `tecnicoId` nulo transforma em ' +
          'veículo da empresa; preenchido, restringe ao técnico informado.',
        body: z.object({
          id: z.coerce.number(),
          idBase: z.coerce.number(),
          nomeVeiculo: z.string().min(1),
          placa: z.string().min(1),
          tecnicoId: z.string().nullable(),
        }),
      },
    },
    async (request, reply) => {
      const { id, idBase, nomeVeiculo, placa, tecnicoId } = request.body

      try {
        const data = await updateVehicleDataFn(
          id,
          idBase,
          nomeVeiculo,
          placa,
          tecnicoId
        )

        if (data.affected === 0) {
          return reply
            .status(404)
            .send({ success: false, message: 'Veículo não encontrado.' })
        }

        return { success: true, data, message: data.message }
      } catch (error) {
        if (error instanceof DuplicatePlateError) {
          return reply.status(409).send({ success: false, message: error.message })
        }
        throw error
      }
    }
  )
}
