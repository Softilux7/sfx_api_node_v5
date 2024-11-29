import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from './_errors/bad-request';

export async function getStatus(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/status/:tipo/:idEmpresa/:idBase', {
      schema: {
        params: z.object({
          tipo: z.string(),
          idEmpresa: z.coerce.number(),
          idBase: z.coerce.number(),
        }),
      },
    },
    async (request) => {
      const { tipo, idEmpresa, idBase } = request.params;

      // Consulta Prisma para buscar o status
      const status = await prisma.status.findFirst({
        where: {
          TIPO: tipo,
          empresa_id: idEmpresa,
          ID_BASE: idBase,
          TFINATIVO: 'N',
        },
        select: {
          NMSTATUS: true,
        },
      });

      // Verifica se o status foi encontrado
      if (!status) {
        throw new BadRequest('Status não encontrado!');
      }

      // Retorna o status encontrado
      return { success: true, data: status };
    });
}
