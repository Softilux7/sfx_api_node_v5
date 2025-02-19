import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// FIXME: Não está pronta
export async function getHistory(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/history/:idBase/:type/:seqos/:cdequipamento', {
      schema: {
        params: z.object({
          idBase: z.coerce.number(),
          type: z.string(),
          seqos: z.coerce.number(),
          cdequipamento: z.coerce.number(),
        }),
      },
    },
      async (request) => {
        const { idBase, type, seqos, cdequipamento } = request.params;

        console.log(idBase, type, seqos, cdequipamento)

        if (type === "attendance") {
            const attendanceHistory =  await prisma.atendimentos.findMany({
                where: {
                    ID_BASE: idBase,
                    SEQOS: seqos
                },
                select: {
                    id: true,
                    DATAHORA: true,
                    SINTOMA: true,
                    CAUSA: true
                },
                take: 15
            }) 
            console.log(attendanceHistory)

            return { success: true, data: attendanceHistory };
        }

        if (type === "orders") {
            const ordersHistory = await prisma.chamados.findMany({
                where: {
                    ID_BASE: idBase,
                    CDEQUIPAMENTO: cdequipamento
                },
                select: {
                    id: true,
                    SEQOS: true,
                    DTATENDIMENTO: true,
                    CONTATO: true,
                    DTINCLUSAO: true,
                    STATUS: true,
                },
                take: 15
            })

            return { success: true, data: ordersHistory };
        }
      });
}
