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
import { getStatus } from './routes/get-status'
import { createAtendimento } from './routes/create-attendance'
import { updateAtendimento } from './routes/update-attendance'
import { getAllEquipmentMeters } from './routes/get-all-equipment-meters'

// Instância Fastify
const app = fastify()

// CORS
app.register(fastifyCors, {
  origin: '*',
})

// Compilers de validação, serialização e erros
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
app.setErrorHandler(errorHandler)

// Routes
app.register(getAllServiceOrderTechnical)
app.register(getClients)
app.register(getDetail)
app.register(createAtendimento)
app.register(updateAtendimento)
app.register(getResumoChamados)
app.register(listTypeCounters)
app.register(getAllEquipmentMeters)
app.register(getStatus)

// Instância API
app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server is running 🔥')
})
