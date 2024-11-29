import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function getAmountServiceOrder(app: FastifyInstance) {
  app
  .withTypeProvider<ZodTypeProvider>()
  .get('/tecnicos/:idTecnico/:idEmpresa/quantidade-chamados',
    {
      schema: {
        params: z.object({       
          idTecnico: z.string(),
          idEmpresa: z.coerce.number(),
        }),
      },
    },

    async (request) => {
      const { idTecnico, idEmpresa } = request.params

      const amountServiceOrder = await prisma.chamados.count({
        where: {
          TFLIBERADO: 'S',
          NMSUPORTET: idTecnico,
          empresa_id: idEmpresa,          
        },
      })    

      return { chamados: amountServiceOrder }   
    },
  )
}
