import { prisma } from '@/lib/prisma'

/**
 * Atualiza a quilometragem do veículo.
 *
 * Aceita `id` (preferencial) ou a placa. A placa continua funcionando porque este
 * endpoint é reenviado pela fila offline do app, e itens já gravados em aparelhos
 * em campo não carregam o id — exigi-lo faria o KM final virar falha permanente.
 */
export async function updateVehicleFn(
  idBase: number,
  placa: string,
  km: number,
  id?: number
) {
  if (id) {
    await prisma.$executeRawUnsafe(
      `
    UPDATE app_veiculos
    SET KM_TOTAL = ?
    WHERE id = ? AND ID_BASE = ?
    `,
      km,
      id,
      idBase
    )
  } else {
    await prisma.$executeRawUnsafe(
      `
    UPDATE app_veiculos
    SET KM_TOTAL = ?
    WHERE ID_BASE = ? AND PLACA = ?
    `,
      km,
      idBase,
      placa
    )
  }

  return { message: 'Quilometragem atualizada com sucesso!' }
}
