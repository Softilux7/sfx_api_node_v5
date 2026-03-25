import { AppError } from '@/infra/http/error'
import { prisma } from '@/lib/prisma'

export async function getTypeCountersFn(idBase: number, cdEquipamento: number) {
  const contractCounters = await prisma.$queryRaw<{ CDMEDIDOR: number }[]>`
    SELECT CDMEDIDOR
    FROM contrato_itens_med
    WHERE ID_BASE = ${idBase}
    AND CDEQUIPAMENTO = ${cdEquipamento}
  `

  if (contractCounters.length === 0) {
    throw new AppError(
      'Código de Medidor não encontrado ou inválido para a base fornecida',
      404
    )
  }

  return contractCounters.map(counter => counter.CDMEDIDOR)
}
