import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { BadRequest } from './_errors/bad-request'

export async function getAllContractCounters(app: FastifyInstance) {
  app
  .withTypeProvider<ZodTypeProvider>()
  .get('/tecnicos/:idBase/:seqContrato/:cdEquipamento/todos-medidores-contrato',
    {
      schema: {
        params: z.object({       
          idBase: z.coerce.number(),
          seqContrato: z.coerce.number(),
          cdEquipamento: z.coerce.number(),
        }),
      },
    },

    async (request) => {
      const { idBase, seqContrato, cdEquipamento } = request.params

      const contractCounters = await prisma.contrato_itens_med.findMany({
        where: {
          ID_BASE: idBase,
          CDEQUIPAMENTO: cdEquipamento,
          SEQCONTRATO: seqContrato,
          TFMEDIDORATIVO: 'S',
        },
        select: {
          CDMEDIDOR: true,
        },
      })    
      
      if (contractCounters.length === 0) {
        throw new BadRequest('Nenhum medidor encontrado para os parâmetros fornecidos.');
      }

      return { medidores: contractCounters }   
    },
  )
}
