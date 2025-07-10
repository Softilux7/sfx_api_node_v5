import { prisma } from '../../lib/prisma'
import { getCompaniesByTechnical } from '../companies/get-companies-technical-repositorie'
import { getLinkedParts } from './get-linked-parts-repositorie'

export async function getAllOrdersRepository(
  idTecnico: string,
  idBase: number,
  status: string,
  options?: {
    seqos?: number
    portalId?: number
    serie?: string
    patrimonio?: string
    orderByRota?: boolean
  }
) {
  const { seqos, portalId, serie, patrimonio, orderByRota } = options || {}

  const orderClause = orderByRota
    ? `
    ORDER BY 
      CASE 
        WHEN c.ROTA_INDEX = -1 THEN 9999
        ELSE c.ROTA_INDEX
      END ASC
  `
    : 'ORDER BY previsao_atendimento ASC'

  const empresas = await getCompaniesByTechnical(idTecnico, idBase)

  let query = `
  SELECT 
    c.id, c.SEQOS, c.CDEMPRESA, c.empresa_id,
    DATE_FORMAT(c.DTINCLUSAO, '%d/%m/%Y') AS DTINCLUSAO,
    DATE_FORMAT(STR_TO_DATE(CONCAT(c.DTPREVENTREGA, ' ', c.HRPREVENTREGA), '%Y-%m-%d %H:%i:%s'), '%d/%m/%Y %H:%i') AS PREVISAOATENDIMENTO,
    c.HRPREVENTREGA, c.HRINCLUSAO, c.NMCLIENTE, c.DTPREVENTREGA, c.ID_BASE, c.NMSUPORTEA,
    CONCAT(DATE_FORMAT(c.DTINCLUSAO, '%d/%m/%Y'), ' ', DATE_FORMAT(c.HRINCLUSAO, '%H:%i')) AS DTHRINCLUSAO,
    c.ENDERECO, c.NUM, c.COMPLEMENTO, c.BAIRRO, c.CIDADE, c.UF, c.CEP, c.CDCLIENTE,
    c.CONTATO, CONCAT('(', c.DDD, ')', ' ', c.FONE) AS telefone, c.EMAIL,
    c.OBSDEFEITOATS, c.OBSDEFEITOCLI, c.DEPARTAMENTO, c.STATUS,
    e.SERIE, e.MODELO, e.DEPARTAMENTO, e.LOCALINSTAL, e.PATRIMONIO, c.CDEQUIPAMENTO,
    d.NMDEFEITO,
    STR_TO_DATE(CONCAT(c.DTPREVENTREGA, ' ', c.HRPREVENTREGA), '%Y-%m-%d %H:%i:%s') AS previsao_atendimento,
    emp.empresa_fantasia, c.SEQCONTRATO,
    (
      SELECT ci.CDPRODUTO
      FROM chamados_itens ci
      INNER JOIN produtos p ON p.ID_BASE = ci.ID_BASE AND p.CDPRODUTO = ci.CDPRODUTO
      WHERE ci.ID_BASE = c.ID_BASE AND ci.SEQOS = c.SEQOS AND TFPENDENTE = 'S'
      LIMIT 1
    ) AS peca_vinculada
  FROM chamados c
  INNER JOIN equipamentos e ON c.CDEQUIPAMENTO = e.CDEQUIPAMENTO AND e.ID_BASE = c.ID_BASE AND e.empresa_id = c.empresa_id
  INNER JOIN defeitos d ON d.CDDEFEITO = c.CDDEFEITO AND d.ID_BASE = c.ID_BASE
  INNER JOIN empresas emp ON emp.id = c.empresa_id
  WHERE c.NMSUPORTET = '${idTecnico}'
    AND c.TFLIBERADO = 'S'
    AND c.ID_BASE = ${idBase}
    AND c.empresa_id IN (${empresas.join(',')})
`

  if (status && status.trim() !== 'N') {
    query += ` AND c.STATUS = '${status}'`
  }

  if (seqos !== undefined) {
    query += ` AND c.SEQOS = ${seqos}`
  }

  if (portalId !== undefined) {
    query += ` AND c.id = ${portalId}`
  }

  if (serie && serie.trim() !== '') {
    query += ` AND e.SERIE = '${serie}'`
  }

  if (patrimonio && patrimonio.trim() !== '') {
    query += ` AND e.PATRIMONIO = '${patrimonio}'`
  }

  // Ordena por ROTA_INDEX
  query += `
  ${orderClause}
  LIMIT 21
`

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const chamados: any[] = await prisma.$queryRawUnsafe(query)

  const formattedData = await Promise.all(
    chamados.map(async chamado => {
      const partsData = await getLinkedParts(chamado.ID_BASE, chamado.SEQOS)

      return {
        sequence: chamado.id,
        seqos: chamado.SEQOS,
        openDate: chamado.DTINCLUSAO || null,
        prevDate: chamado.previsao_atendimento,
        status: chamado.STATUS,
        cdstatus: chamado.CDSTATUS,
        cdempresa: chamado.empresa_id,
        company: chamado.empresa_fantasia,
        client: {
          code: chamado.CDCLIENTE,
          nmcliente: chamado.NMCLIENTE,
          endereco: chamado.ENDERECO,
          bairro: chamado.BAIRRO,
          cep: chamado.CEP,
          uf: chamado.UF,
          cidade: chamado.CIDADE,
          num: chamado.NUM,
          fone: chamado.telefone,
          email: chamado.EMAIL,
        },
        equipment: {
          code: chamado.CDEQUIPAMENTO?.toString() || null,
          serial: chamado.SERIE || null,
          model: chamado.MODELO || null,
          obsdefectcli: chamado.OBSDEFEITOCLI || null,
          obsdefectats: chamado.OBSDEFEITOATS || null,
        },
        parts: partsData.parts, // array de peças vinculadas
      }
    })
  )

  return formattedData
}
