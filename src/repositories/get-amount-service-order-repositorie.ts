import { prisma } from '../lib/prisma';
import { BadRequest } from '../routes/_errors/bad-request';

export async function getAmountServiceOrder(idTecnico: string, idEmpresa: number) {

    // Consulta Prisma para buscar os chamados
    const amountServiceOrder = await prisma.chamados.count({
        where: {
            TFLIBERADO: 'S',
            NMSUPORTET: idTecnico,
            empresa_id: idEmpresa,          
        },
    })  

      // Verifica se os chamados foram encontrados
      if (!amountServiceOrder) {
        throw new BadRequest('Chamados não encontrados!');
      }

       // Retorna o quantidade de chamados encontrados
       return { chamados: amountServiceOrder } 
}