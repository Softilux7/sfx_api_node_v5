import { prisma } from '@/lib/prisma'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import scalarFastifyApiReference from '@scalar/fastify-api-reference'
import fastify, { type FastifyError } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { registerRoutes } from '.'
import { env } from './env'
import { AppError } from './error'

// Log com data/hora ISO (antes só console.log, sem hora nem rota) e IP real do técnico
// vindo do proxy do Apache. Requisição normal não é logada: ver o hook onResponse.
const app = fastify({
  logger: {
    level: 'info',
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  },
  disableRequestLogging: true,
  trustProxy: true,
})

// Só o que interessa para suporte: respostas de erro e respostas lentas.
const SLOW_RESPONSE_MS = 3000

app.addHook('onResponse', (request, reply, done) => {
  const ms = Math.round(reply.elapsedTime)
  if (reply.statusCode >= 400 || ms >= SLOW_RESPONSE_MS) {
    request.log.warn(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        ms,
        ip: request.ip,
      },
      'resposta'
    )
  }
  done()
})

app.register(fastifyJwt, { secret: env.JWT_SECRET })

// app.decorate('authenticate', async (request: any, reply: any) => {
//   try {
//     await request.jwtVerify()
//   } catch {
//     throw new AppError('Token inválido ou expirado.', 401)
//   }
// })

app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por exemplo
  },
})

app.register(fastifyCors, { origin: '*' })

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Configurações Documentação
// O ecosystem de produção usa NODE_ENV='prod': a documentação ficava exposta em produção.
if (!['production', 'prod'].includes(env.NODE_ENV)) {
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

  app.register(scalarFastifyApiReference, {
    routePrefix: '/docs',
    configuration: {
      theme: 'moon',
    },
  })
}

app.setErrorHandler((error: FastifyError, request, reply) => {
  // Erros esperados da aplicação
  if (error instanceof AppError) {
    request.log.info({ statusCode: error.status }, error.message)
    return reply.status(error.status).send({
      message: error.message,
    })
  }

  // Erros de validação Zod (campos inválidos)
  if (hasZodFastifySchemaValidationErrors(error)) {
    request.log.warn({ issues: error.validation }, 'validação recusada')
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.validation,
    })
  }

  // Erros do próprio Fastify e dos plugins com status 4xx (arquivo grande demais, corpo
  // inválido...): antes viravam 500 genérico e o app ficava reenviando algo que nunca passa.
  if (
    typeof error.statusCode === 'number' &&
    error.statusCode >= 400 &&
    error.statusCode < 500
  ) {
    request.log.warn({ err: error }, error.message)
    return reply.status(error.statusCode).send({
      message: error.message,
      code: error.code,
    })
  }

  // Erro inesperado: continua 500 (o app tenta de novo), agora com código e id para o log.
  request.log.error({ err: error }, 'erro inesperado')
  return reply.status(500).send({
    message: 'Internal server error.',
    code: error.code,
    reqId: request.id,
  })
})

// Registro de rotas
registerRoutes(app)

// Hook de shutdown para desconectar o Prisma quando o servidor encerrar
app.addHook('onClose', async () => {
  await prisma.$disconnect()
})

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  app.log.info(`Servidor rodando em http://localhost:${env.PORT}`)
})
