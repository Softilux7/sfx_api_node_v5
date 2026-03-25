import { AppError } from '@/infra/http/error'
import { prisma } from '@/lib/prisma'

export async function listAllEquipmentMetersFn(
  idBase: number,
  cdEquipamento: number
) {
  const meters = await prisma.$queryRaw<{ CDMEDIDOR: number }[]>`
  SELECT CDMEDIDOR FROM equipamento_medidores WHERE ID_BASE = ${idBase} AND CDEQUIPAMENTO = ${cdEquipamento}`

  if (!meters || meters.length === 0) {
    throw new AppError('Equipamento não encontrado', 404)
  }

  return meters
}
