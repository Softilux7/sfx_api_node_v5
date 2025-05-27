import { BadRequest } from '../../infra/http/routes/@errors/bad-request'
import { prisma } from '../../lib/prisma'

export async function getCompaniesByTechnical(
  tecnicoId: string,
  idBase: number
) {
  // Busca o técnico na base
  const tecnico = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id 
    FROM users 
    WHERE tecnico_id = ${tecnicoId} 
      AND empresa_id = ${idBase}
    LIMIT 1`

  if (tecnico.length === 0) {
    throw new BadRequest(
      'Técnico não encontrado ou inválido para a base fornecida.'
    )
  }

  // Busca as empresas vinculadas ao técnico
  const empresas = await prisma.$queryRaw<{ empresa_id: number }[]>`
    SELECT empresa_id 
    FROM users_empresas 
    WHERE user_id = ${tecnico[0].id}`

  // Extrai os IDs das empresas como array
  return empresas.map(empresa => empresa.empresa_id)
}
