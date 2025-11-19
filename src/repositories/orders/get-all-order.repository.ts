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

  // Se status for "O" (concluídos), ordena pelo chamado mais novo primeiro (DESC)
  let orderClause = ''
  if (status && status.trim() === 'O') {
    orderClause = `
    ORDER BY 
      COALESCE(c.DTFECHAMENTO, '1970-01-01 00:00:00') DESC,
      c.id DESC
  `
  } else if (orderByRota) {
    orderClause = `
    ORDER BY 
      CASE 
        WHEN c.ROTA_INDEX = -1 THEN 9999
        ELSE c.ROTA_INDEX
      END ASC
  `
  } else {
    orderClause = 'ORDER BY previsao_atendimento ASC'
  }

  const empresas = await getCompaniesByTechnical(idTecnico, idBase)

  let query = `
  SELECT DISTINCT
    c.id, c.SEQOS, c.CDEMPRESA, c.empresa_id,
    DATE_FORMAT(c.DTINCLUSAO, '%d/%m/%Y') AS DTINCLUSAO,
    DATE_FORMAT(STR_TO_DATE(CONCAT(c.DTPREVENTREGA, ' ', c.HRPREVENTREGA), '%Y-%m-%d %H:%i:%s'), '%d/%m/%Y %H:%i') AS PREVISAOATENDIMENTO,
    c.HRPREVENTREGA, c.HRINCLUSAO, c.DTFECHAMENTO, c.NMCLIENTE, c.DTPREVENTREGA, c.ID_BASE, c.NMSUPORTEA,
    CONCAT(DATE_FORMAT(c.DTINCLUSAO, '%d/%m/%Y'), ' ', DATE_FORMAT(c.HRINCLUSAO, '%H:%i')) AS DTHRINCLUSAO,
    c.ENDERECO, c.NUM, c.COMPLEMENTO, c.BAIRRO, c.CIDADE, c.UF, c.CEP, c.CDCLIENTE,
    c.CONTATO, CONCAT('(', c.DDD, ')', ' ', c.FONE) AS telefone, c.EMAIL,
    c.OBSDEFEITOATS, c.OBSDEFEITOCLI, c.DEPARTAMENTO, c.STATUS,
    e.SERIE, e.MODELO, e.DEPARTAMENTO, e.LOCALINSTAL, e.CDCLIENTEENT, e.PATRIMONIO, c.CDEQUIPAMENTO,
    d.NMDEFEITO,
    t.NMOSTP,
    STR_TO_DATE(CONCAT(c.DTPREVENTREGA, ' ', c.HRPREVENTREGA), '%Y-%m-%d %H:%i:%s') AS previsao_atendimento,
    emp.empresa_fantasia, emp.empresa_nome, c.SEQCONTRATO,
    cl.FANTASIA AS cliente_entrega_fantasia,
    (
      SELECT ci.CDPRODUTO
      FROM chamados_itens ci
      INNER JOIN produtos p ON p.ID_BASE = ci.ID_BASE AND p.CDPRODUTO = ci.CDPRODUTO
      WHERE ci.ID_BASE = c.ID_BASE AND ci.SEQOS = c.SEQOS AND TFPENDENTE = 'S' AND TF_TROCA_KIT_TECNICO = 'N'
      LIMIT 1
    ) AS peca_vinculada
  FROM chamados c
  INNER JOIN equipamentos e ON c.CDEQUIPAMENTO = e.CDEQUIPAMENTO AND e.ID_BASE = c.ID_BASE AND e.empresa_id = c.empresa_id
  INNER JOIN defeitos d ON d.CDDEFEITO = c.CDDEFEITO AND d.ID_BASE = c.ID_BASE
  INNER JOIN chamado_tipos t ON t.CDOSTP = c.CDOSTP AND t.ID_BASE = c.ID_BASE
  INNER JOIN empresas emp ON emp.id = c.empresa_id
  LEFT JOIN clientes cl ON e.CDCLIENTEENT = cl.CDCLIENTE AND e.ID_BASE = cl.ID_BASE AND e.empresa_id = cl.empresa_id
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

  // Aplica a ordenação (DTFECHAMENTO DESC para status "O", ROTA_INDEX para rota, ou previsao_atendimento ASC padrão)
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
        type: chamado.NMOSTP,
        openDate: chamado.DTINCLUSAO || null,
        hourOpen: chamado.HRINCLUSAO,
        prevDate: chamado.PREVISAOATENDIMENTO,
        closeDate: chamado.DTFECHAMENTO || null,
        status: chamado.STATUS,
        cdstatus: chamado.CDSTATUS,
        cdempresa: chamado.empresa_id,
        nmdefeito: chamado.NMDEFEITO,
        company: chamado.empresa_nome,
        companyFantasy: chamado.empresa_fantasia,
        client: {
          code: chamado.CDCLIENTE,
          nmcliente: chamado.NMCLIENTE,
          endereco: chamado.ENDERECO,
          complemento: chamado.COMPLEMENTO,
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
          patrimonio: chamado.PATRIMONIO || null,
          local_instal: chamado.LOCALINSTAL || null,
          departamento: chamado.DEPARTAMENTO || null,
          model: chamado.MODELO || null,
          obsdefectcli: chamado.OBSDEFEITOCLI || null,
          obsdefectats: chamado.OBSDEFEITOATS || null,
          cliente_entrega_fantasia: chamado.cliente_entrega_fantasia || null,
        },
        parts: partsData.parts, // array de peças vinculadas
      }
    })
  )

  return formattedData
}
