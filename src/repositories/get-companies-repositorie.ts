import { prisma } from '../lib/prisma';
import { BadRequest } from '../routes/_errors/bad-request';

export async function getCompanies(idBase: number) {
  
    const empresas = await prisma.$queryRaw<{ id: number; empresa_fantasia: string }[]>`
    SELECT id, empresa_fantasia FROM empresas WHERE matriz_id = ${idBase}`;

    // Verifica se as empresas foram encontradas
    if (empresas.length === 0) {
        throw new BadRequest('Empresas não encontradas!');
    }

    // Retorna as empresas encontradas
    return { success: true, data: empresas };
}
