import type { FastifyInstance } from 'fastify'
import { addAtendimentoMeters } from './routes/add-meters-items'
import { createAtendimento } from './routes/create-attendance'
import { deleteVehicle } from './routes/delete-vehicle'
import { getAllEquipmentMeters } from './routes/get-all-equipment-meters'
import { getAllServiceOrderTechnical } from './routes/get-all-service-order-technical'
import { getHistoryAttendance } from './routes/get-history-attendance'
import { getHistoryEquipmentsOrders } from './routes/get-history-order'
import { getHistoryEquipmentsOrdersDetails } from './routes/get-history-order-detail'
import { getParts } from './routes/get-linked-parts'
import { getResumoChamados } from './routes/get-service-order-resume'
import { getStatus } from './routes/get-status'
import { listTypeCounters } from './routes/get-type-counters'
import { listEquipments } from './routes/list-equipments'
import { listVehicles } from './routes/list-vehicles'
import { registerExpoToken } from './routes/register-expo-token'
import { registerVehicle } from './routes/register-vehicle'
import { sendNotificationRoute } from './routes/send-notification'
import { sendSMS } from './routes/send-sms'
import { updateAtendimento } from './routes/update-attendance'
import { updateVehicle } from './routes/update-vehicle'
import { uploadPhotos } from './routes/upload-photos'

export async function registerRoutes(app: FastifyInstance) {
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
  app.register(getHistoryEquipmentsOrders)
  app.register(getHistoryEquipmentsOrdersDetails)
  app.register(registerVehicle)
  app.register(listVehicles)
  app.register(updateVehicle)
  app.register(deleteVehicle)
  app.register(getParts)
  app.register(listEquipments)
}
