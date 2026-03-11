import { prisma } from '../../lib/prisma'

export async function listVehiclePlatesRepositorie(idBase: number) {
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

  if (veiculos.length > 0) {
    return { success: true, data: veiculos }
  }

  return { success: false, data: [] }
}
