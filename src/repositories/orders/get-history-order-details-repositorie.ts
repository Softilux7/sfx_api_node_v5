import { prisma } from '../../lib/prisma'

export async function getOrdersHistoryDetails(
  idBase: number,
  sequence: number
) {
  // dados do chamado
  const chamado = await prisma.$queryRaw<
    {
      id: number
      sequence: number
      dtInclusion: string | null
      dtConclusion: string | null
      dtAttendance: string | null
      dtPrevAttendance: string | null
      defectType: string | null
      defectClient: string | null
      defectAtendente: string | null
      contact: string | null
      status: string | null
      tpChamado: string | null
      cdequipamento: number | null
      serie: string | null
      modelo: string | null
      patrimonio: string | null
      departamento: string | null
    }[]
  >`
    SELECT 
      c.id AS id,
      c.SEQOS AS sequence,
      DATE_FORMAT(CONCAT(c.DTINCLUSAO, ' ', c.HRINCLUSAO), '%d/%m/%Y %H:%i') AS dtInclusion,
      DATE_FORMAT(CONCAT(c.DTPREVENTREGA, ' ', c.HRPREVENTREGA), '%d/%m/%Y %H:%i') AS dtConclusion,
      DATE_FORMAT(CONCAT(c.DTATENDIMENTO, ' ', c.HRATENDIMENTO), '%d/%m/%Y %H:%i') AS dtAttendance,
      DATE_FORMAT(
        STR_TO_DATE(CONCAT(c.DTPREVENTREGA, ' ', c.HRPREVENTREGA), '%Y-%m-%d %H:%i:%s'),
        '%d/%m/%Y %H:%i'
      ) AS dtPrevAttendance,
      d.NMDEFEITO AS defectType,
      c.OBSDEFEITOCLI AS defectClient,
      c.OBSDEFEITOATS AS defectAtendente,
      c.CONTATO AS contact,
      c.STATUS AS status,
      ct.NMOSTP AS tpChamado,
      e.CDEQUIPAMENTO AS cdequipamento,
      e.SERIE AS serie,
      e.MODELO AS modelo,
      e.PATRIMONIO AS patrimonio,
      e.DEPARTAMENTO AS departamento
    FROM chamados c
    INNER JOIN defeitos d 
      ON d.CDDEFEITO = c.CDDEFEITO 
     AND d.ID_BASE = c.ID_BASE
    INNER JOIN chamado_tipos ct
      ON ct.CDOSTP = c.CDOSTP
     AND ct.ID_BASE = c.ID_BASE
    INNER JOIN equipamentos e
      ON e.CDEQUIPAMENTO = c.CDEQUIPAMENTO
     AND e.ID_BASE = c.ID_BASE
    WHERE c.ID_BASE = ${idBase}
      AND c.SEQOS = ${sequence}
  `

  if (!chamado.length) return null

  // últimos 10 atendimentos
  const attendances = await prisma.$queryRaw<
    {
      dtVisita: string | null
      hrAtendimento: string | null
      hrAtendimentoFin: string | null
      sintoma: string | null
      causa: string | null
      acao: string | null
      obsAtendimento: string | null
      cdMedidor: string | null
      medidor: number | null
    }[]
  >`
    SELECT 
      DATE_FORMAT(a.DTATENDIMENTO, '%d/%m/%Y') AS dtVisita,
      DATE_FORMAT(a.HRATENDIMENTO, '%H:%i') AS hrAtendimento,
      DATE_FORMAT(a.HRATENDIMENTOFIN, '%H:%i') AS hrAtendimentoFin,
      a.SINTOMA AS sintoma,
      a.CAUSA AS causa,
      a.ACAO AS acao,
      a.OBSERVACAO AS obsAtendimento,
      a.CDMEDIDOR AS cdMedidor,
      a.MEDIDOR AS medidor
    FROM atendimentos a
    WHERE a.SEQOS = ${sequence}
      AND a.ID_BASE = ${idBase}
    ORDER BY a.DTATENDIMENTO DESC, a.HRATENDIMENTO DESC
    LIMIT 10
  `
  const partsQuery = `
    SELECT
        ci.QUANTIDADE, ci.CDPRODUTO, p.NMPRODUTO 
    FROM
        chamados_itens ci
    INNER JOIN produtos p ON
        p.ID_BASE = ci.ID_BASE
        and p.CDPRODUTO = ci.CDPRODUTO
    WHERE
        ci.ID_BASE = ${idBase}
        and ci.SEQOS = ${sequence}
        and TF_TROCA_KIT_TECNICO = 'S'
  `

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const linkedParts = await prisma.$queryRawUnsafe<any[]>(partsQuery)

  const parts = linkedParts.map(peca => ({
    quantidade: peca.QUANTIDADE,
    cdproduto: peca.CDPRODUTO,
    nmproduto: peca.NMPRODUTO || 'Produto não especificado',
  }))

  return {
    ...chamado[0],
    attendances,
    parts,
  }
}
