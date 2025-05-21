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
import { uploadPhotos } from './routes/upload-photos'
import { registerExpoToken } from "./routes/register-expo-token";
import { sendNotificationRoute } from "./routes/send-notification";
import { registerVehicle } from "./routes/register-vehicle";
import { listVehicles } from "./routes/list-vehicles";
import fastifyMultipart from "@fastify/multipart";
import { getHistoryAttendance } from "./routes/get-history-attendance";

// Instância Fastify
const app = fastify()

app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB por exemplo
  }
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
app.register(registerExpoToken)
app.register(sendNotificationRoute)
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
app.register(registerVehicle)
app.register(listVehicles)

// Instância API
app.listen({ port: 3308, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server is running 🔥')
})
