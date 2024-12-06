import { prisma } from '../lib/prisma';
import { BadRequest } from '../routes/_errors/bad-request';


export async function getTypeCounters(idBase: number, cdEquipamento: number) {

    const contractCounters = await prisma.contrato_itens_med.findMany({
      where: {
        ID_BASE: idBase,
        CDEQUIPAMENTO: cdEquipamento,
      },
      select: {
        CDMEDIDOR: true,
      },
    })    

    if(!contractCounters){
        throw new BadRequest('Código de Medidor não encontrado ou inválido para a base fornecida')
    }
  
    // Extrai os IDs das empresas como array
    return contractCounters.map((contractCounters) => contractCounters.CDMEDIDOR);
}
