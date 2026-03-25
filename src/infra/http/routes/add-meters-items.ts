import { addAtendimentoMetersFn } from '@/functions/attendances/add-attendance-meters'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const addAtendimentoMeters: FastifyPluginAsyncZod = async app => {
  app.post(
    '/atendimentos-medidores/add',
    {
      schema: {
        tags: ['attendances'],
        summary: 'Adicionar medidores ao atendimento',
        description:
          'Endpoint para registrar ou atualizar os medidores vinculados a um atendimento.',
        body: z.object({
          id: z.number(),
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
    async request => {
      await addAtendimentoMetersFn(request.body)

      return {
        success: true,
        message: 'Medidores atualizados',
      }
    }
  )
}
