import * as path from "path";
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import fastifyCors from '@fastify/cors'
import { errorHandler } from './error-handler'
import { getAllServiceOrderTechnical } from './routes/get-all-service-order-technical'
import { getResumoChamados } from './routes/get-service-order-resume'
import { listTypeCounters } from './routes/get-type-counters'
import { getStatus } from './routes/get-status'
import { createAtendimento } from './routes/create-attendance'
import { updateAtendimento } from './routes/update-attendance'
import { getAllEquipmentMeters } from './routes/get-all-equipment-meters'
import { addAtendimentoMeters } from './routes/add-meters-items'
import { sendSMS } from './routes/send-sms'
import fastifyStatic from "@fastify/static";
import { uploadPhotos } from './routes/upload-photos'
import { getHistoryAttendance } from './routes/get-history-attendance'

// Instância Fastify
const app = fastify()

app.register(fastifyStatic, {
  root: path.join(__dirname, "..", "uploads"),
  prefix: "/uploads/",
});

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
app.register(createAtendimento)
app.register(updateAtendimento)
app.register(addAtendimentoMeters)
app.register(getResumoChamados)
app.register(listTypeCounters)
app.register(sendSMS)
app.register(getAllEquipmentMeters)
app.register(getStatus)
app.register(uploadPhotos)
app.register(getHistoryAttendance)

// Instância API
app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server is running 🔥')
})
