import { createAttendaceFn } from '@/functions/attendances/create-attendance'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const createAtendimento: FastifyPluginAsyncZod = async app => {
  app.post(
    '/atendimentos/add',
    {
      schema: {
        tags: ['attendances'],
        summary: 'Criar atendimento',
        description: 'Endpoint para criação de um novo atendimento.',
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
    async request => {
      const atendimento = await createAttendaceFn(request.body)

      return {
        success: true,
        message: 'Atendimento criado com sucesso!',
        atendimento,
      }
    }
  )
}
