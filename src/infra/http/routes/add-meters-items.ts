import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { addAtendimentoMetersService } from '../../../repositories/attendance/add-attendance-meters'

export async function addAtendimentoMeters(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/atendimentos-medidores/add',
    {
      schema: {
        body: z.object({
          id: z.number(), // Id do atendimento
          ID_BASE: z.coerce.number(),
          empresa_id: z.coerce.number(),
          cdequipamento: z.number(),
          informante: z.string(),
          meters_list: z.array(
            z.object({
              CDMEDIDOR: z.string(),
              MEDIDOR: z.number(),
            })
          ),
        }),
      },
    },
    async (request, reply) => {
      try {
        await addAtendimentoMetersService(request.body)

        return reply.send({
          success: true,
          message: 'Medidores atualizados',
        })
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } catch (error: any) {
        console.error('Erro ao adicionar medidores:', error.message)
        return reply
          .status(500)
          .send({ success: false, message: error.message })
      }
    }
  )
}
