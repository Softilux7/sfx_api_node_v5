import { prisma } from '@/lib/prisma'

/** Remove o veículo por `id` (preferencial) ou pela placa, para o app antigo. */
export async function deleteVehicleFn(idBase: number, placa: string, id?: number) {
  if (id) {
    await prisma.$executeRawUnsafe(
      'DELETE FROM app_veiculos WHERE id = ? AND ID_BASE = ?',
      id,
      idBase
    )
  } else {
    await prisma.$executeRawUnsafe(
      'DELETE FROM app_veiculos WHERE ID_BASE = ? AND PLACA = ?',
      idBase,
      placa
    )
  }

  return { message: 'Veículo deletado com sucesso!' }
}
