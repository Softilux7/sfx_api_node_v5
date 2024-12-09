import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import fastifyCors from '@fastify/cors'
import { errorHandler } from './error-handler'
import { getAllServiceOrderTechnical } from './routes/get-all-service-order-technical'
import { getClients } from './routes/get-clients'
import { getDetail } from './routes/get-detail'
import { getResumoChamados } from './routes/get-service-order-resume'
import { listTypeCounters } from './routes/get-type-counters'

// Instância Fastify
const app = fastify()

app.register(getAllServiceOrderTechnical)
app.register(getClients)
app.register(getDetail)
app.register(getResumoChamados)
app.register(listTypeCounters)

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
