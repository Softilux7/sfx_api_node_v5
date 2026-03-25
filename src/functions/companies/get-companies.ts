import { AppError } from '@/infra/http/error'
import { prisma } from '@/lib/prisma'

export async function getCompanies(idBase: number) {
  const empresas = await prisma.$queryRaw<
    { id: number; empresa_fantasia: string }[]
  >`
    SELECT id, empresa_fantasia FROM empresas WHERE matriz_id = ${idBase}`

  if (empresas.length === 0) {
    throw new AppError('Empresas não encontradas!', 404)
  }

  return empresas
}
