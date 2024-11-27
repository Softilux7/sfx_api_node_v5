import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { BadRequest } from './_errors/bad-request'

export async function getCompanyTechnical(app: FastifyInstance) {
  // console.log("TESTE")
  app
  .withTypeProvider<ZodTypeProvider>()
  .get('/tecnicos/:tecnicoId/:idBase/empresas',
    {
      schema: {
        params: z.object({
          tecnicoId: z.string(),
          idBase: z.coerce.number(),
        }),
      },
    },
    async (request) => {
      const { tecnicoId, idBase } = request.params

      // Query para encontrar o user_id correspondente ao técnico e base
      const tecnico = await prisma.users.findFirst({
        where: {
          tecnico_id: tecnicoId,
          empresa_id: idBase,
        },
        select: {
          id: true,
        },
      })

      if (!tecnico) {
        throw new BadRequest('Técnico não encontrado ou inválido para a base fornecida.')
      }

      // Query para buscar as empresas relacionadas ao técnico (filiais)
      const empresas = await prisma.users_empresas.findMany({
        where: {
          user_id: tecnico.id,
        },
        select: {
          empresa_id: true,
        },
      })

      // Extrair os IDs das empresas e transformar em uma string separada por vírgulas
      const empresaIds = empresas.map((empresa) => empresa.empresa_id).join(',')

      return { empresas: empresaIds }
    },
  )
}
