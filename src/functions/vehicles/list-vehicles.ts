import { prisma } from '@/lib/prisma'

type VehicleRow = {
  id: number
  ID_BASE: number
  nome_veiculo: string
  placa: string
  KM_TOTAL: number
  TECNICO_ID: string | null
}

/**
 * Lista os veículos da base.
 *
 * `TECNICO_ID` nulo/vazio = veículo da empresa, visível para todos os técnicos.
 * Preenchido = veículo pessoal, visível só para o dono (a coluna guarda o NOME do
 * técnico, que é o mesmo valor que o app envia em `tecnicoId`).
 *
 * Sem `tecnicoId` devolve a base inteira — comportamento de que as versões antigas
 * do app dependem.
 */
export async function listVehiclesFn(idBase: number, tecnicoId?: string | null) {
  const owner = tecnicoId?.trim() ? tecnicoId.trim() : null

  const veiculos = await prisma.$queryRawUnsafe<VehicleRow[]>(
    `
    SELECT
      id,
      ID_BASE,
      nome_veiculo,
      placa,
      KM_TOTAL,
      TECNICO_ID
    FROM app_veiculos
    WHERE ID_BASE = ?
      AND (
        ? IS NULL
        OR TECNICO_ID IS NULL
        OR TRIM(TECNICO_ID) = ''
        OR TRIM(TECNICO_ID) = ?
      )
    ORDER BY nome_veiculo
    `,
    idBase,
    owner,
    owner
  )

  return veiculos
}
