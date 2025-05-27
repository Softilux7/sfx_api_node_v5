import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getHistoryAtendimentoRepository } from '../../../repositories/attendance/get-history-attendance-repositorie'

// Rota de busca do histórico de atendimentos da OS
export async function getHistoryAttendance(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/historico/:idChamado',
    {
      schema: {
        params: z.object({
          idChamado: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idChamado } = request.params

      const result = await getHistoryAtendimentoRepository(idChamado)

      return result
    }
  )
}
