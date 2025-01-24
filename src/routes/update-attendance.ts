import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from './_errors/bad-request';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { updateAttendance } from '../repositories/update-attendance-repositorie';

export async function updateAtendimento(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put(
      '/atendimentos/update',
      {
        schema: {
          body: z.object({
            id: z.number(), // Id do atendimento
            progress: z.number(), // Progresso atual do atendimento
            ID_BASE: z.coerce.number(),
            params: z.object({
              VALFINANCEIRO: z.string().optional(), // Exemplo de valor financeiro que será convertido
              KMFINAL: z.coerce.number().optional(),
              KMINICIAL: z.coerce.number().optional(),
              HRATENDIMENTOFIN: z.string().optional(), // Hora de fim do atendimento
              HRATENDIMENTO: z.string().optional(), // Hora de fim do atendimento
              TEMPOATENDIMENTO: z.number().optional(), // Tempo de atendimento
              DTVIAGEMFIN: z.coerce.date().optional(), // Data e hora de fim da viagem
              DTVIAGEMINI: z.date().optional(), // Data e hora de início da viagem
              HRVIAGEMINI: z.string().optional(), // Hora de início da viagem
              HRVIAGEMFIN: z.string().optional(), // Hora de fim da viagem
              DESLOCAMENTO_APP: z.number().optional(),
            }),
          }),
        },
      },
      async (request, reply) => {
        const { id, progress, ID_BASE, params } = request.body;

        try {
          // Verifica se o atendimento existe
          const atendimento = await prisma.atendimentos.findUnique({
            where: { id },
          });

          if (!atendimento) {
            throw new BadRequest('Atendimento não encontrado.');
          }

          const updatedAttendance = await updateAttendance(id, ID_BASE, progress, params)

          return reply.send({
            success: true,
            message: `Progresso de atendimento atualizado: ${progress}`,
            updatedAttendance,

          });
        } catch (error: any) {
          console.error('Erro ao atualizar atendimento:', error.message);
          return reply.status(500).send({ success: false, message: error.message });
        }
      }
    );
}
