import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getStatusRepository } from '../repositories/orders/get-status-repositorie';

export async function getStatus(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/status/:idEmpresa', {
      schema: {
        params: z.object({
          idEmpresa: z.coerce.number()
        }),
      },
    },
      async (request) => {
        const { idEmpresa } = request.params;

        // Chama o repositório
        const status = await getStatusRepository(idEmpresa);

        return status;
      });
}