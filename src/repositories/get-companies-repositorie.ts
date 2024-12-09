import { prisma } from '../lib/prisma';
import { BadRequest } from '../routes/_errors/bad-request';

export async function getStatus(tipo: string, idEmpresa: number, idBase: number) {

    // Consulta Prisma para buscar as empresas
    const empresas = await prisma.empresas.findMany({
        where: {
          matriz_id: idBase,
        },
        select: {
          id: true,
          empresa_fantasia: true,
        },
      });

      // Verifica se as empresas foram encontradas
      if (empresas.length === 0) {
        throw new BadRequest('Empresas não encontradas!')
      }

       // Retorna o empresas encontradas
       return { success: true, data: empresas}
    ;
}