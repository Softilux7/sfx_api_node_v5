import { prisma } from '../lib/prisma';
import { BadRequest } from '../routes/_errors/bad-request';


export async function getCompaniesByTechnical(tecnicoId: string, idBase: number) {
  // Busca o técnico na base
  const tecnico = await prisma.users.findFirst({
    where: {
      tecnico_id: tecnicoId,
      empresa_id: idBase,
    },
    select: {
      id: true,
    },
  });

  if (!tecnico) {
    throw new BadRequest('Técnico não encontrado ou inválido para a base fornecida.');
  }

  // Busca as empresas vinculadas ao técnico
  const empresas = await prisma.users_empresas.findMany({
    where: {
      user_id: tecnico.id,
    },
    select: {
      empresa_id: true,
    },
  });

  // Extrai os IDs das empresas como array
  return empresas.map((empresa) => empresa.empresa_id);
}
