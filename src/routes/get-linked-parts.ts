import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from './_errors/bad-request';

export async function getLinkedParts(app: FastifyInstance) {
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

      // Query para buscar as peças vinculadas
      const linkedParts = await prisma.chamados_itens.findMany({
        where: {
          ID_BASE: idBase,
          SEQOS: seqOs,
          TFPENDENTE: 'S',
        },
        select: {
          QUANTIDADE: true,
          CDPRODUTO: true,
          produtos: {
            select: {
              NMPRODUTO: true
            }
          }
        },
      });

      
      if (!linkedParts || linkedParts.length === 0) {
        throw new BadRequest('Não existem peças vinculadas para esse chamado') ;
      }

      // Mapeamento das peças vinculadas
      const parts = linkedParts.map((peca) => ({
        quantidade: peca.QUANTIDADE,
        cdproduto: peca.CDPRODUTO,
        nmproduto: peca.produtos?.NMPRODUTO,
      }));

      return { success: true, data: parts } 
      
    });
}
