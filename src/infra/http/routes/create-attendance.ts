import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { createAtendimentoService } from '../../../repositories/attendance/create-attendance-repositorie'

export async function createAtendimento(app: FastifyInstance) {
  console.log('TESTE')
  app.withTypeProvider<ZodTypeProvider>().post(
    '/atendimentos/add',
    {
      schema: {
        body: z.object({
          SEQOS: z.number(),
          CDSTATUS: z.string(),
          STATUS: z.string(),
          NMATENDENTE: z.string().max(10),
          OBSERVACAO: z.string().max(600),
          chamado_id: z.number(),
          empresa_id: z.coerce.number(),
          ID_BASE: z.coerce.number(),
          ATIVO_APP: z.number(),
          KMINICIAL: z.coerce.number(),
          PLACAVEICULO: z.string().max(15),
          ANDAMENTO_CHAMADO_APP: z.number(),
          ORIGEM_CADASTRO: z.string().optional(),
          granted_geolocation: z.number().optional(),
          DESLOCAMENTO_APP: z.number().optional(),
          LATITUDE: z.number().default(0).optional(),
          LONGITUDE: z.number().default(0).optional(),
        }),
      },
    },
    async (request, reply) => {
      try {
        const atendimento = await createAtendimentoService(request.body)
        return reply.send({
          success: true,
          message: 'Atendimento criado com sucesso!',
          atendimento,
        })
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } catch (error: any) {
        console.error('Erro ao criar atendimento:', error.message)
        return reply
          .status(500)
          .send({ success: false, message: error.message })
      }
    }
  )
}
