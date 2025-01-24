import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from './_errors/bad-request';

export async function getClients(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/clientes/:idEmpresa', {
      schema: {
        params: z.object({
          idEmpresa: z.coerce.number(),
        }),
      },
    },
      async (request) => {
        const { idEmpresa } = request.params;

        // Consulta Prisma para buscar os clientes
        const clientes = await prisma.clientes.findMany({
          where: {
            empresa_id: idEmpresa,
          },
          select: {
            CDCLIENTE: true,
            FANTASIA: true,
          },
        });

        // Verifica se o array de clientes está vazio
        if (clientes.length === 0) {
          throw new BadRequest('Clientes não encontrados!');
        }

        // Retorna os dados dos clientes encontrados
        return { success: true, data: clientes };
      });
}
