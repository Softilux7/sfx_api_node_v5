import { updateAttendanceFn } from '@/functions/attendances/update-attendance'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const updateAtendimento: FastifyPluginAsyncZod = async app => {
  app.put(
    '/atendimentos/update',
    {
      schema: {
        tags: ['attendances'],
        summary: 'Atualizar atendimento',
        description:
          'Endpoint para atualização do progresso e informações de um atendimento.',
        body: z.object({
          id: z.number(),
          progress: z.number(),
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
            FOLLOWUP: z.string().optional(),
            SINTOMA: z.string().optional(),
            ACAO: z.string().optional(),
            CAUSA: z.string().optional(),
            NOME_CONTATO: z.string().optional(),
            SEQOS: z.number().optional(),
            CDSTATUS: z.string().optional(),
            STATUS: z.string().optional(),
            NMATENDENTE: z.string().optional(),
            DESTINO_POS_ATENDIMENTO_APP: z.number().optional(),
            PARTS: z
              .array(
                z.object({
                  quantidade: z.number(),
                  cdproduto: z.string(),
                  nmproduto: z.string(),
                })
              )
              .optional(),
          }),
        }),
      },
    },
    async request => {
      const { id, progress, ID_BASE, params } = request.body

      const updatedAttendance = await updateAttendanceFn(
        id,
        ID_BASE,
        progress,
        params
      )

      return {
        success: true,
        message: `Progresso de atendimento atualizado: ${progress}`,
        updatedAttendance,
      }
    }
  )
}
