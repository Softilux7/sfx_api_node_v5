import { BadRequest } from '../../infra/http/routes/@errors/bad-request'
import { prisma } from '../../lib/prisma'

export async function getTypeCounters(idBase: number, cdEquipamento: number) {
  const contractCounters = await prisma.$queryRaw<{ CDMEDIDOR: number }[]>`
    SELECT CDMEDIDOR 
    FROM contrato_itens_med 
    WHERE ID_BASE = ${idBase} 
    AND CDEQUIPAMENTO = ${cdEquipamento}
  `

  if (contractCounters.length === 0) {
    throw new BadRequest(
      'Código de Medidor não encontrado ou inválido para a base fornecida'
    )
  }

  // Extrai os IDs das empresas como array
  return contractCounters.map(counter => counter.CDMEDIDOR)
}
