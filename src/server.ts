import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import fastifyCors from '@fastify/cors'
import { errorHandler } from './error-handler'
import { getCompanyTechnical } from './routes/get-companies-technical'
import { getAllContractCounters } from './routes/get-all-contract-counters'
import { getAmountServiceOrder } from './routes/get-amount-service-order'
import { listTypeContractCounters } from './routes/get-type-contract-counters'

// Instância Fastify
const app = fastify()

app.register(getCompanyTechnical)
app.register(getAllContractCounters)
app.register(getAmountServiceOrder)
app.register(listTypeContractCounters)

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
