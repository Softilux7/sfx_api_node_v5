import { validateLicenseFn } from '@/functions/license/validate-license'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const validateLicenseRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/license/validate',
    {
      schema: {
        tags: ['app-auth'],
        summary: 'Validar licença',
        description:
          'Valida o campo app_license do usuário em users e exige registro do dispositivo em app_subs. ' +
          'Retorna 403 NOT_AUTHORIZED quando app_license = N ou quando não há registro para o device. ' +
          'Quando autorizado, atualiza o registro do dispositivo (versões e último acesso).',
        body: z.object({
          user_id: z.number().int(),
          device_id: z.string().min(1),
          android_version: z.string().min(1).optional(),
          app_version: z.string().min(1).optional(),
          last_access: z.coerce.date().optional(),
        }),
      },
    },
    async request => {
      const { user_id, device_id, android_version, app_version, last_access } = request.body

      const data = await validateLicenseFn({
        userId: user_id,
        deviceId: device_id,
        androidVersion: android_version,
        appVersion: app_version,
        lastAccess: last_access,
      })

      return { authorized: data.authorized, code: 'AUTHORIZED' }
    }
  )
}
