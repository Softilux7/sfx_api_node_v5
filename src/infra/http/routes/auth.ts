import { loginFn } from '@/functions/auth/login'
import { createLicenseFn } from '@/functions/license/create-license'
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
          id_base: z.number().int(),
        }),
      },
    },
    async (request, reply) => {
      const { user_email, password_hash, device_id, android_version, app_version, id_base } =
        request.body

      const user = await loginFn({ email: user_email, passwordHash: password_hash })

      // Valida app_license (lança 403 NOT_AUTHORIZED se N) e registra/atualiza o device em app_subs
      await createLicenseFn({
        userId: user.id,
        deviceId: device_id,
        androidVersion: android_version,
        appVersion: app_version,
        idBase: id_base,
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
