import { prisma } from '../../lib/prisma'

export async function getOrdersHistory(idBase: number, cdequipamento: number) {
  return prisma.$queryRaw<
    {
      id: number
      SEQOS: number
      DTATENDIMENTO: Date
      CONTATO: string
      DTINCLUSAO: Date
      STATUS: string
    }[]
  >`
        SELECT 
        id, 
        SEQOS, 
        DTATENDIMENTO, 
        CONTATO, 
        DTINCLUSAO, 
        STATUS 
        FROM chamados 
        WHERE ID_BASE = ${idBase} 
          AND CDEQUIPAMENTO = ${cdequipamento} 
        LIMIT 15
    `
}
