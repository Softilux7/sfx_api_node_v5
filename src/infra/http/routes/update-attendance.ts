import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { updateAttendance } from '../../../repositories/attendance/update-attendance-repositorie'
import { BadRequest } from './@errors/bad-request'

// Rota de atualização de atendimento
export async function updateAtendimento(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/atendimentos/update',
    {
      schema: {
        body: z.object({
          id: z.number(), // Id do atendimento
          progress: z.number(), // Progresso atual do atendimento
          ID_BASE: z.coerce.number(),
          params: z.object({
            MOTIVO_PAUSA: z.string().optional(),
            ID_TRANSACTION: z.number().optional(),
            LATITUDE: z.number().optional(),
            LONGITUDE: z.number().optional(),
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
            NMATENDENTE: z.string().optional(),
            DESTINO_POS_ATENDIMENTO_APP: z.number().optional(),
          }),
        }),
      },
    },
    async (request, reply) => {
      const { id, progress, ID_BASE, params } = request.body

      try {
        // Verifica se o atendimento existe
        const atendimento = await prisma.atendimentos.findUnique({
          where: { id },
        })

        if (!atendimento) {
          throw new BadRequest('Atendimento não encontrado.')
        }

        const updatedAttendance = await updateAttendance(
          id,
          ID_BASE,
          progress,
          params
        )

        return reply.send({
          success: true,
          message: `Progresso de atendimento atualizado: ${progress}`,
          updatedAttendance,
        })
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } catch (error: any) {
        console.error('Erro ao atualizar atendimento:', error.message)
        return reply
          .status(400)
          .send({ success: false, message: error.message })
      }
    }
  )
}
