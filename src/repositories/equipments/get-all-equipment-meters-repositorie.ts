import { BadRequest } from '../../infra/http/routes/@errors/bad-request'
import { prisma } from '../../lib/prisma'

export async function listAllEquipmentMeters(
  idBase: number,
  cdEquipamento: number
) {
  const meters = await prisma.$queryRaw<{ CDMEDIDOR: number }[]>`
  SELECT CDMEDIDOR FROM equipamento_medidores WHERE ID_BASE = ${idBase} AND CDEQUIPAMENTO = ${cdEquipamento}`

  if (!meters || meters.length === 0) {
    throw new BadRequest('Equipamento não encontrado')
  }

  return meters
}
