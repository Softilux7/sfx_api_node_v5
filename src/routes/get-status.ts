import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getStatusRepository } from '../repositories/get-status-repositorie';

export async function getStatus(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/status/:idEmpresa/:type', {
      schema: {
        params: z.object({
          type: z.string(),
          idEmpresa: z.coerce.number()
        }),
      },
    },
      async (request) => {
        const { type, idEmpresa } = request.params;

        // Chama o repositório
        const status = await getStatusRepository(type, idEmpresa);

        return status; // Retorna o JSON já tratado pelo repositório
      });
}