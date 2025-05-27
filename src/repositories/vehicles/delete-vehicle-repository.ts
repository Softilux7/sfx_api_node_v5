import { prisma } from '../../lib/prisma'

export async function deleteVehicleRepository(idBase: number, placa: string) {
  await prisma.$executeRawUnsafe(
    'DELETE FROM app_veiculos WHERE ID_BASE = ? AND PLACA = ?',
    idBase,
    placa
  )

  return { success: true, message: 'Veículo deletado com sucesso!' }
}
