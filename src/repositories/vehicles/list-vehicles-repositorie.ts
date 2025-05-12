import { prisma } from "../../lib/prisma";

export async function listVehiclePlatesRepositorie(
  idBase: number,
  nomeVeiculo?: string,
  placa?: string,
) {
  let query = `
    SELECT 
      ID_BASE,
      nome_veiculo,
      placa,
      KM_TOTAL
    FROM app_veiculos
    WHERE ID_BASE = ?
  `;

  const params: any[] = [idBase];

  if (nomeVeiculo) {
    query += ` AND nome_veiculo = ?`;
    params.push(nomeVeiculo);
  }

  if (placa) {
    query += ` AND placa = ?`;
    params.push(placa);
  }

  const veiculos = await prisma.$queryRawUnsafe<
    { ID_BASE: number; nome_veiculo: string; placa: string; KM_TOTAL: number; }[]
  >(query, ...params);

  if (veiculos.length > 0) {
    return { success: true, data: veiculos };
  }

  return { success: false, data: [] };
}
