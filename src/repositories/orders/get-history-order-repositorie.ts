import { prisma } from '../../lib/prisma'

export async function getOrdersHistory(idBase: number, cdequipamento: number) {
  return prisma.$queryRaw<
    {
      id: number
      sequence: number
      dtInclusion: string | null
      dtConclusion: string | null
      dtAttendance: string | null
      dtForecast: string | null
      defectType: string | null
      defectClient: string | null
      contact: string | null
      status: string | null
    }[]
  >`
    SELECT 
      c.id AS id,
      c.SEQOS AS sequence,
      DATE_FORMAT(CONCAT(c.DTINCLUSAO, ' ', c.HRINCLUSAO), '%d/%m/%Y %H:%i') AS dtInclusion,
      DATE_FORMAT(c.DTFECHAMENTO, '%d/%m/%Y %H:%i') AS dtConclusion,
      DATE_FORMAT(CONCAT(c.DTATENDIMENTO, ' ', c.HRATENDIMENTO), '%d/%m/%Y %H:%i') AS dtAttendance,
      DATE_FORMAT(STR_TO_DATE(CONCAT(c.DTPREVENTREGA, ' ', c.HRPREVENTREGA), '%Y-%m-%d %H:%i:%s'), '%d/%m/%Y %H:%i') AS dtPrevAttendance,
      d.NMDEFEITO AS defectType,
      c.OBSDEFEITOCLI AS defectClient,
      c.CONTATO AS contact,
      c.STATUS AS status
    FROM chamados c
    INNER JOIN defeitos d 
      ON d.CDDEFEITO = c.CDDEFEITO 
     AND d.ID_BASE = c.ID_BASE
    WHERE c.ID_BASE = ${idBase}
      AND c.CDEQUIPAMENTO = ${cdequipamento}
    ORDER BY c.DTINCLUSAO DESC
    LIMIT 20
  `
}
