import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import fastifyCors from '@fastify/cors'
import { errorHandler } from './error-handler'
import { getCompanyTechnical } from './routes/get-companies-technical'

// Instância Fastify
const app = fastify()

app.register(getCompanyTechnical)

// CORS
app.register(fastifyCors, {
  origin: '*',
})

// Compilers de validação, serialização e erros
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
app.setErrorHandler(errorHandler)

// Instância API
app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server is running')
})
