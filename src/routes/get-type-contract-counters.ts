import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function listTypeContractCounters(app: FastifyInstance) {
  app
  .withTypeProvider<ZodTypeProvider>()
  .get('/tecnicos/:idBase/:cdEquipamento/lista-tipo-medidor-contrato',
    {
      schema: {
        params: z.object({       
          idBase: z.coerce.number(),
          cdEquipamento: z.coerce.number(),
        }),
      },
    },

    async (request) => {
      const { idBase, cdEquipamento } = request.params

      const listTypeMedidor = await prisma.equipamento_medidores.count({
        where: {
            ID_BASE: idBase,
            CDEQUIPAMENTO: cdEquipamento,                   
        },
        select:{
            CDMEDIDOR: true,
        }
      })    

      return { chamados: listTypeMedidor }   
    },
  )
}
