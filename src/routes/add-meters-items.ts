import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from './_errors/bad-request';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function addAtendimentoMeters(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/atendimentos-medidores/add',
      {
        schema: {
          body: z.object({
            id: z.number(), // Id do atendimento
            ID_BASE: z.coerce.number(),
            empresa_id: z.coerce.number(),
            cdequipamento: z.number(),
            informante: z.string(),
            meters_list: z.array(
                z.object({
                  CDMEDIDOR: z.string(), // CDMEDIDOR como string
                  MEDIDOR: z.number(),   // MEDIDOR como número
                })
              ),
          }),
        },
      },
      async (request, reply) => {
        const { id, cdequipamento, empresa_id, ID_BASE, informante, meters_list } = request.body;

        try {
          // Verifica se o atendimento existe
          const atendimentoMedidores = await prisma.atendimentos_medidores.createMany({
            data: meters_list.map(meter => ({
                ID_BASE,
                empresa_id,
                INFORMANTE: informante,
                CD_ATENDIMENTO_ORIGEM: id,
                DT_LEITURA: new Date(),
                CDEQUIPAMENTO: cdequipamento,
                CDMEDIDOR: meter.CDMEDIDOR,
                MEDIDOR: meter.MEDIDOR
              }))
          });

          if (!atendimentoMedidores) {
            throw new BadRequest('Atendimento não encontrado para inserção de medidores.');
          }

          return reply.send({
            success: true,
            message: "Medidores atualizados",
          });

        } catch (error: any) {
          console.error('Erro ao atualizar atendimento:', error.message);
          return reply.status(500).send({ success: false, message: error.message });
        }
      }
    );
}
