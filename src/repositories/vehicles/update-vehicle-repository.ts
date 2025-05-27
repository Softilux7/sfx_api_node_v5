import { prisma } from '../../lib/prisma'

export async function updateVehicleRepository(
  idBase: number,
  placa: string,
  km: number
) {
  await prisma.$queryRawUnsafe(
    `
    UPDATE app_veiculos
    SET KM_TOTAL = ?
    WHERE ID_BASE = ? AND PLACA = ?
    `,
    km,
    idBase,
    placa
  )

  return { success: true, message: 'Quilometragem atualizada com sucesso!' }
}
