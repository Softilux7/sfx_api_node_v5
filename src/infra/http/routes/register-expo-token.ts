import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { registerExpoTokenRepository } from '../../../repositories/notifications/register-expo-token-repository'

// Rota de registro de token (notificação expo)
export async function registerExpoToken(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/register-expo-token',
    {
      schema: {
        body: z.object({
          idEmpresa: z.number(),
          tecnicoId: z.string(),
          token: z.string(),
        }),
      },
    },
    async request => {
      const { idEmpresa, tecnicoId, token } = request.body

      const result = await registerExpoTokenRepository(
        idEmpresa,
        tecnicoId,
        token
      )

      return result
    }
  )
}
