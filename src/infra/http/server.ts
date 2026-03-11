import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { registerRoutes } from '.'

const app = fastify()

app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por exemplo
  },
})

app.register(fastifyCors, { origin: '*' })

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler((error, _, reply) => {
  if (error) {
    console.log(error)
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.validation,
    })
  }

  //TODO: Envia os dados para um grafana ou um datadog

  console.error(error)

  return reply.status(500).send({ message: 'Internal server error.' })
})

// Registro de rotas
registerRoutes(app)

// Hook de shutdown para desconectar o Prisma quando o servidor encerrar
app.addHook('onClose', async () => {
  await prisma.$disconnect()
})

app.listen({ port: 3308, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server is running!')
})
