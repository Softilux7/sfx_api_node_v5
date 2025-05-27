import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastify from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { addAtendimentoMeters } from './routes/add-meters-items'
import { createAtendimento } from './routes/create-attendance'
import { deleteVehicle } from './routes/delete-vehicle'
import { getAllEquipmentMeters } from './routes/get-all-equipment-meters'
import { getAllServiceOrderTechnical } from './routes/get-all-service-order-technical'
import { getHistoryAttendance } from './routes/get-history-attendance'
import { getHistoryOrders } from './routes/get-history-order'
import { getResumoChamados } from './routes/get-service-order-resume'
import { getStatus } from './routes/get-status'
import { listTypeCounters } from './routes/get-type-counters'
import { listVehicles } from './routes/list-vehicles'
import { registerExpoToken } from './routes/register-expo-token'
import { registerVehicle } from './routes/register-vehicle'
import { sendNotificationRoute } from './routes/send-notification'
import { sendSMS } from './routes/send-sms'
import { updateAtendimento } from './routes/update-attendance'
import { updateVehicle } from './routes/update-vehicle'
import { uploadPhotos } from './routes/upload-photos'

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
  if (hasZodFastifySchemaValidationErrors(error)) {
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
app.register(getHistoryOrders)
app.register(registerVehicle)
app.register(listVehicles)
app.register(updateVehicle)
app.register(deleteVehicle)

app.get('/', async (request, reply) => {
  return { message: 'API funcionando corretamente 👌' }
})

app.listen({ port: 3308, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server is running!')
})
