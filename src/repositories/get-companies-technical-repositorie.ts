import { prisma } from '../lib/prisma';
import { BadRequest } from '../routes/_errors/bad-request';

export async function getCompaniesByTechnical(tecnicoId: string, idBase: number) {
  // Busca o técnico na base
  const tecnico = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id 
    FROM users 
    WHERE tecnico_id = ${tecnicoId} 
      AND empresa_id = ${idBase}
    LIMIT 1`;

  if (!tecnico.length) {
    throw new BadRequest('Técnico não encontrado ou inválido para a base fornecida.');
  }

  console.log(tecnico, "## TECNICO ##");

  // Busca as empresas vinculadas ao técnico
  const empresas = await prisma.$queryRaw<{ empresa_id: number }[]>`
    SELECT empresa_id 
    FROM users_empresas 
    WHERE user_id = ${tecnico[0].id}`;

  // Extrai os IDs das empresas como array
  return empresas.map((empresa) => empresa.empresa_id);
}
