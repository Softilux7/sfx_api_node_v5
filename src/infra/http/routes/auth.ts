import { loginFn } from '@/functions/auth/login'
import { sessionFn } from '@/functions/app-subs/session'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const authRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/auth',
    {
      schema: {
        tags: ['auth'],
        summary: 'Login',
        description:
          'Autentica o usuário, valida/cria a licença do dispositivo e retorna o token JWT. Retorna 403 se o dispositivo estiver bloqueado.',
        body: z.object({
          user_email: z.email(),
          password_hash: z.string().min(1),
          device_id: z.string().min(1),
          android_version: z.string().min(1),
          app_version: z.string().min(1),
        }),
      },
    },
    async (request, reply) => {
      const { user_email, password_hash, device_id, android_version, app_version } = request.body

      const user = await loginFn({ email: user_email, passwordHash: password_hash })

      // Valida app_license + cria/valida licença do dispositivo — lança 403 se bloqueado
      await sessionFn({
        userId: user.id,
        deviceId: device_id,
        androidVersion: android_version,
        appVersion: app_version,
      })

      const token = app.jwt.sign(
        {
          userId: user.id,
          empresaId: user.empresaId,
          tecnicoId: user.tecnicoId,
        },
        { expiresIn: '30d' }
      )

      return reply.status(200).send({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          base: user.empresaId,
          tecnicoId: user.tecnicoId,
          logo: user.empresaLogo,
          filial: user.filialId,
        },
      })
    }
  )
}
