import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function getStatus(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/status/:idEmpresa/:type', {
      schema: {
        params: z.object({
          idEmpresa: z.coerce.number(),
          type: z.string(),
        }),
      },
    },
      async (request) => {
        const { idEmpresa, type } = request.params;

        // Consulta Prisma para buscar o status
        const status = await prisma.status.findMany({
          where: {
            TIPO: type,
            ID_BASE: idEmpresa,
            TFINATIVO: 'N',
          },
          select: {
            NMSTATUS: true,
            CDSTATUS: true,
            TIPO: true,
          },
        });


        return { success: true, data: status };
      });
}
