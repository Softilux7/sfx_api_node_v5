import { AppError } from '@/infra/http/error'
import { prisma } from '@/lib/prisma'

export async function getCompaniesByTechnical(
  tecnicoId: string,
  idBase: number
) {
  const tecnico = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id
    FROM users
    WHERE tecnico_id = ${tecnicoId}
      AND empresa_id = ${idBase}
    LIMIT 1`

  if (tecnico.length === 0) {
    throw new AppError(
      'Técnico não encontrado ou inválido para a base fornecida.',
      404
    )
  }

  const empresas = await prisma.$queryRaw<{ empresa_id: number }[]>`
    SELECT empresa_id
    FROM users_empresas
    WHERE user_id = ${tecnico[0].id}`

  return empresas.map(empresa => empresa.empresa_id)
}
