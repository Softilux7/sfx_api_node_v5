import { prisma } from '../lib/prisma';
import { BadRequest } from '../routes/_errors/bad-request';

export async function getTypeCounters(idBase: number, cdEquipamento: number) {
  const contractCounters = await prisma.$queryRaw<{ CDMEDIDOR: number }[]>`
    SELECT CDMEDIDOR 
    FROM contrato_itens_med 
    WHERE ID_BASE = ${idBase} 
    AND CDEQUIPAMENTO = ${cdEquipamento}
  `;

  if (!contractCounters.length) {
    throw new BadRequest('Código de Medidor não encontrado ou inválido para a base fornecida');
  }

  // Extrai os IDs das empresas como array
  return contractCounters.map((counter) => counter.CDMEDIDOR);
}