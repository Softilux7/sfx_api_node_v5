import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from './_errors/bad-request';

export async function getCompanies(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/empresas/:idBase', {
      schema: {
        params: z.object({
          idBase: z.coerce.number(),
        }),
      },
    },
    async (request) => {
      const { idBase } = request.params;

        // Consulta Prisma para buscar as empresas
        const empresas = await prisma.empresas.findMany({
          where: {
            matriz_id: idBase,
          },
          select: {
            id: true,
            empresa_fantasia: true,
          },
        });


        if (empresas.length === 0) {
            throw new BadRequest('Empresas não encontradas!')
          }

          return { success: true, data: empresas}
    });
}
