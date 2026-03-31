import { prisma } from '@/lib/prisma'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
// import scalarFastifyApiReference from '@scalar/fastify-api-reference'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { registerRoutes } from '.'
import { env } from './env'
import { AppError } from './error'

const app = fastify()

app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por exemplo
  },
})

app.register(fastifyCors, { origin: '*' })

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Configurações Documentação
if (env.NODE_ENV !== 'production') {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'API APP',
        description: 'API de integração APP e PWS',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
        },
      ],
    },
    transform: jsonSchemaTransform,
  })

  // app.register(scalarFastifyApiReference, {
  //   routePrefix: '/docs',
  //   configuration: {
  //     theme: 'moon',
  //   },
  // })
}

app.setErrorHandler((error, _request, reply) => {
  console.log(error)

  // Erros esperados da aplicação
  if (error instanceof AppError) {
    return reply.status(error.status).send({
      message: error.message,
    })
  }

  // Erros de validação Zod (campos inválidos)
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.validation,
    })
  }

  // Erro inesperado ()
  return reply.status(500).send({
    message: 'Internal server error.',
  })
})

// Registro de rotas
registerRoutes(app)

// Hook de shutdown para desconectar o Prisma quando o servidor encerrar
app.addHook('onClose', async () => {
  await prisma.$disconnect()
})

app.listen({ port: 3308, host: '0.0.0.0' }).then(() => {
  console.log(`Servidor rodando em http://localhost:${env.PORT}`)
})
