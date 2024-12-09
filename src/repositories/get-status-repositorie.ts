import { prisma } from '../lib/prisma';
import { BadRequest } from '../routes/_errors/bad-request';

export async function getStatus(tipo: string, idEmpresa: number, idBase: number) {

    // Consulta Prisma para buscar o status
    const status = await prisma.status.findFirst({
        where: {
            TIPO: tipo,
            empresa_id: idEmpresa,
            ID_BASE: idBase,
            TFINATIVO: 'N',
        },
        select: {
            NMSTATUS: true,
            }
        });

      // Verifica se o status foi encontrado
      if (!status) {
        throw new BadRequest('Status não encontrado!');
      }

       // Retorna o status encontrado
       return { success: true, data: status };
    ;
}