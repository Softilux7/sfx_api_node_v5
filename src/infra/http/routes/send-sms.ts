import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { client } from '../../../lib/twilio'

// Rota de envio de sms via twillio
export async function sendSMS(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/send-sms',
    {
      schema: {
        body: z.object({
          phone: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { phone } = request.body

      // Gerar um código de 4 dígitos
      const code = Math.floor(1000 + Math.random() * 9000).toString()

      try {
        // Enviar SMS com o código gerado
        const message = await client.messages.create({
          body: `Seu código de verificação é: ${code}`,
          from: '+18312737813', // Número Twilio
          to: phone,
        })

        console.log('Mensagem enviada com SID:', message.sid)

        // Retorna o código gerado para o app validar depois
        return reply.send({ success: true, code })
      } catch (error) {
        console.error('Erro ao enviar SMS:', error)
        return reply
          .status(500)
          .send({ success: false, error: 'Falha ao enviar SMS' })
      }
    }
  )
}
