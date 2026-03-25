import { env } from '../env'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import twilio from 'twilio'
import { z } from 'zod'

export const sendSMS: FastifyPluginAsyncZod = async app => {
  app.post(
    '/send-sms',
    {
      schema: {
        tags: ['notifications'],
        summary: 'Enviar SMS de verificação',
        description: 'Envia um SMS com código de verificação via Twilio.',
        body: z.object({
          phone: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { phone } = request.body

      const code = Math.floor(1000 + Math.random() * 9000).toString()

      const client = twilio(env.ACCOUNT, env.AUTH)

      const message = await client.messages.create({
        body: `Seu código de verificação é: ${code}`,
        from: '+18312737813',
        to: phone,
      })

      console.log('Mensagem enviada com SID:', message.sid)

      return reply.send({ success: true, data: { code } })
    }
  )
}
