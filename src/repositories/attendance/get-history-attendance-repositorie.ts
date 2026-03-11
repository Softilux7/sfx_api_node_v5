import { prisma } from '../../lib/prisma'

export async function getHistoryAtendimentoRepository(
  idChamado: number,
  idBase: number
) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const result = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      a.id, 
      a.NMATENDENTE, 
      DATE_FORMAT(a.DTATENDIMENTO, '%d/%m/%Y') AS dt_atendimento,
      DATE_FORMAT(a.HRATENDIMENTO, '%H:%i') AS hr_ini, 
      DATE_FORMAT(a.HRATENDIMENTOFIN, '%H:%i') AS hr_fim,
      a.CAUSA, 
      a.SINTOMA, 
      a.ACAO, 
      a.SEQOS, 
      a.OBSERVACAO, 
      c.OBSDEFEITOATS,
      d.NMDEFEITO, 
      a.NMATENDENTE, 
      a.ANDAMENTO_CHAMADO_APP
    FROM atendimentos a
    INNER JOIN chamados c ON c.id = a.chamado_id
    INNER JOIN defeitos d ON d.CDDEFEITO = c.CDDEFEITO 
      AND d.ID_BASE = a.ID_BASE
    WHERE a.chamado_id = ${idChamado}
      AND a.ID_BASE = ${idBase}
      AND a.ANDAMENTO_CHAMADO_APP = 30
    ORDER BY a.id DESC
  `)

  if (result.length > 0) {
    return { success: true, data: result }
  }

  return { success: false, data: [] }
}
