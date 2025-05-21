import { getHistoryAtendimentoRepository } from '../repositories/attendance/get-history-attendance-repositorie';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
export async function getHistoryAttendance(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/historico/:idChamado', {
      schema: {
        params: z.object({
          idChamado: z.coerce.number()
        }),
      },
    },
      async (request) => {
        const { idChamado } = request.params;

        const result = await getHistoryAtendimentoRepository(idChamado);

        return result;
      });
}