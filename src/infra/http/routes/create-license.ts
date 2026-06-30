import { createLicenseFn } from '@/functions/license/create-license'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const createLicenseRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/license',
    {
      schema: {
        tags: ['app-auth'],
        summary: 'Registrar licença',
        description:
          'Registra o dispositivo em app_subs. Cria o registro na primeira vez e atualiza dados/último acesso nas seguintes.',
        body: z.object({
          user_id: z.number().int(),
          device_id: z.string().min(1),
          android_version: z.string().min(1),
          app_version: z.string().min(1),
          id_base: z.number().int(),
        }),
      },
    },
    async request => {
      const { user_id, device_id, android_version, app_version, id_base } = request.body

      const data = await createLicenseFn({
        userId: user_id,
        deviceId: device_id,
        androidVersion: android_version,
        appVersion: app_version,
        idBase: id_base,
      })

      return { created: data.created }
    }
  )
}
