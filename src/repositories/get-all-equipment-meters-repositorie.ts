import { prisma } from '../lib/prisma';
import { BadRequest } from '../routes/_errors/bad-request';


export async function listAllEquipmentMeters(idBase: number, cdEquipamento: number) {

    const meters = await prisma.equipamento_medidores.findMany({
      where: {
        ID_BASE: idBase,
        CDEQUIPAMENTO: cdEquipamento,
      },
      select: {
        CDMEDIDOR: true,
      },
    })    

    if(!meters){
        throw new BadRequest('Equipamento não encontrado')
    }
  
    // Extrai os IDs das empresas como array
    return meters;
}
