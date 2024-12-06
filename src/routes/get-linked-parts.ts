import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getLinkedParts } from '../services/get-linked-parts-service';

export async function getLinkedPart(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/pecas/:idBase/:seqOs', {
      schema: {
        params: z.object({
          idBase: z.coerce.number(),
          seqOs: z.coerce.number(),
        }),
      },
    },
    
    async (request) => {
      const { idBase, seqOs } = request.params;

      // Busca as peças vinculadas através do serviço `getLinkedParts`.
      const linkedParts = await getLinkedParts(idBase, seqOs);

      return { success: true, data: linkedParts};     
    });
}
