import { prisma } from '../../lib/prisma';

export async function registerVehicleRepositorie(
  idBase: number,
  tecnicoId: string,
  nomeVeiculo: string,
  placa: string,
  km: number
) {
  await prisma.$executeRawUnsafe(`
    INSERT INTO app_veiculos 
      (ID_BASE, TECNICO_ID, nome_veiculo, placa, KM_TOTAL)
    VALUES 
      (?, ?, ?, ?, ?)
  `, idBase, tecnicoId, nomeVeiculo, placa, km);

  return { success: true, message: 'Veículo criado com sucesso!' };
}
