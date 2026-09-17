import { prisma } from '@/lib/prisma'
import { DuplicatePlateError, isDuplicatePlateError } from './duplicate-plate'

/**
 * Cadastra um veículo. `tecnicoId` nulo cria um veículo da empresa, visível para
 * todos os técnicos da base.
 */
export async function registerVehicleFn(
  idBase: number,
  tecnicoId: string | null,
  nomeVeiculo: string,
  placa: string,
  km: number
) {
  const owner = tecnicoId?.trim() ? tecnicoId.trim() : null

  try {
    await prisma.$executeRawUnsafe(
      `
    INSERT INTO app_veiculos
      (ID_BASE, TECNICO_ID, nome_veiculo, placa, KM_TOTAL)
    VALUES
      (?, ?, ?, ?, ?)
  `,
      idBase,
      owner,
      nomeVeiculo,
      placa,
      km
    )
  } catch (error) {
    // `placa` é UNIQUE: sem esta tradução o app recebe um 500 genérico.
    if (isDuplicatePlateError(error)) throw new DuplicatePlateError()
    throw error
  }

  return { message: 'Veículo criado com sucesso!' }
}
