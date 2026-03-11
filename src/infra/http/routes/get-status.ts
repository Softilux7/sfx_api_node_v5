import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getStatusRepository } from '../../../repositories/orders/get-status-repositorie'

// Rota de busca por status da empresa
export async function getStatus(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/status/:idEmpresa',
    {
      schema: {
        params: z.object({
          idEmpresa: z.coerce.number(),
        }),
      },
    },
    async request => {
      const { idEmpresa } = request.params

      const status = await getStatusRepository(idEmpresa)

      return status
    }
  )
}
