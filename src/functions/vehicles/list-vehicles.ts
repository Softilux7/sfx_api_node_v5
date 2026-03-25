import { prisma } from '@/lib/prisma'

export async function listVehiclesFn(idBase: number) {
  const veiculos = await prisma.$queryRawUnsafe<
    { ID_BASE: number; nome_veiculo: string; placa: string; KM_TOTAL: number }[]
  >(
    `
    SELECT
      ID_BASE,
      nome_veiculo,
      placa,
      KM_TOTAL
    FROM app_veiculos
    WHERE ID_BASE = ?
    `,
    idBase
  )

  return veiculos
}
