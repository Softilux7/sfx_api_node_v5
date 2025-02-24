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
              VALFINANCEIRO: z.string().optional(),
              VALESTACIONAMENTO: z.number().optional(),
              VALPEDAGIO: z.number().optional(),
              VALOUTRASDESP: z.number().optional(),
              QUILOMETRAGEM: z.number().optional(),
              CDMEDIDOR: z.string().optional(),
              MEDIDOR: z.number().optional(),
              HRATENDIMENTOFIN: z.string().optional(),
              HRATENDIMENTO: z.string().optional(),
              TEMPOATENDIMENTO: z.number().optional(),
              DTVIAGEMFIN: z.coerce.date().optional(),
              DTVIAGEMINI: z.date().optional(),
              HRVIAGEMINI: z.string().optional(),
              HRVIAGEMFIN: z.string().optional(),
              DESLOCAMENTO_APP: z.number().optional(),
              KMFINAL: z.coerce.number().optional(),
              OBSERVACAO: z.string().optional(),
              SINTOMA: z.string().optional(),
              ACAO: z.string().optional(),
              CAUSA: z.string().optional(),
              NOME_CONTATO: z.string().optional(),
              SEQOS: z.number().optional(),
              CDSTATUS: z.string().optional(),
              STATUS: z.string().optional(),
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
