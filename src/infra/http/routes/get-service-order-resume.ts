import { getResumoChamadosFn } from '@/functions/orders/get-service-order-resume'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getResumoChamados: FastifyPluginAsyncZod = async app => {
  app.get(
    '/tecnicos/:tecnicoId/:idBase/resumo-chamados',
    {
      schema: {
        tags: ['orders'],
        summary: 'Resumo de chamados do técnico',
        description:
          'Endpoint para obter o resumo de chamados por status de um técnico (utilizado no dashboard).',
        params: z.object({
          tecnicoId: z.string(),
          idBase: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { tecnicoId, idBase } = request.params

      const data = await getResumoChamadosFn(tecnicoId, idBase)

      return {
        success: true,
        data,
      }
    }
  )
}
