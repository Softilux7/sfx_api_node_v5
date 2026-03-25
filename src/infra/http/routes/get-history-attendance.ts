import { getHistoryAtendimentoFn } from '@/functions/attendances/get-history-attendance'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getHistoryAttendance: FastifyPluginAsyncZod = async app => {
  app.get(
    '/historico/:idBase/:idChamado',
    {
      schema: {
        tags: ['attendances'],
        summary: 'Histórico de atendimentos da OS',
        description:
          'Endpoint para buscar o histórico de atendimentos vinculados a um chamado.',
        params: z.object({
          idChamado: z.coerce.number(),
          idBase: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idChamado, idBase } = request.params

      const result = await getHistoryAtendimentoFn(idChamado, idBase)

      return result
    }
  )
}
