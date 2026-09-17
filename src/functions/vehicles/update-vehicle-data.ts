import { prisma } from '@/lib/prisma'
import { DuplicatePlateError, isDuplicatePlateError } from './duplicate-plate'

/**
 * Edita os dados do veículo: nome, placa e dono.
 *
 * Chaveada por `id` porque a própria placa pode mudar aqui — ao contrário da
 * atualização de quilometragem, que segue aceitando a placa por causa da fila
 * offline do app.
 *
 * `tecnicoId` nulo transforma em veículo da empresa (visível para toda a base);
 * preenchido, restringe ao técnico dono.
 */
export async function updateVehicleDataFn(
  id: number,
  idBase: number,
  nomeVeiculo: string,
  placa: string,
  tecnicoId: string | null
) {
  const owner = tecnicoId?.trim() ? tecnicoId.trim() : null

  let affected: number
  try {
    affected = await prisma.$executeRawUnsafe(
      `
    UPDATE app_veiculos
    SET nome_veiculo = ?, placa = ?, TECNICO_ID = ?
    WHERE id = ? AND ID_BASE = ?
    `,
      nomeVeiculo,
      placa,
      owner,
      id,
      idBase
    )
  } catch (error) {
    if (isDuplicatePlateError(error)) throw new DuplicatePlateError()
    throw error
  }

  return { affected, message: 'Veículo atualizado com sucesso!' }
}
