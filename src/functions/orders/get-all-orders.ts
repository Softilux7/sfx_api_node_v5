import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getCompaniesByTechnical } from '../companies/get-companies-by-technical'
import { getLinkedPartsBySeqosFn } from './get-linked-parts'

export async function getAllOrdersFn(
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

  let orderClause: Prisma.Sql
  if (status && status.trim() === 'O') {
    orderClause = Prisma.sql`
    ORDER BY
      COALESCE(c.DTFECHAMENTO, '1970-01-01 00:00:00') DESC,
      c.id DESC
  `
  } else if (orderByRota) {
    orderClause = Prisma.sql`
    ORDER BY
      CASE
        WHEN c.ROTA_INDEX = -1 THEN 9999
        ELSE c.ROTA_INDEX
      END ASC
  `
  } else {
    orderClause = Prisma.sql`ORDER BY previsao_atendimento ASC`
  }

  const empresas = await getCompaniesByTechnical(idTecnico, idBase)

  // Técnico sem empresa vinculada: `IN ()` era erro de SQL (500).
  if (empresas.length === 0) return []

  // Filtros como parâmetros: antes técnico, status, série e patrimônio eram concatenados no
  // SQL ($queryRawUnsafe) e a rota é pública — SQL injection.
  const filtros: Prisma.Sql[] = []

  if (status && status.trim() !== 'N') {
    filtros.push(Prisma.sql`AND c.STATUS = ${status}`)
  }

  if (seqos !== undefined) {
    filtros.push(Prisma.sql`AND c.SEQOS = ${seqos}`)
  }

  if (portalId !== undefined) {
    filtros.push(Prisma.sql`AND c.id = ${portalId}`)
  }

  if (serie && serie.trim() !== '') {
    filtros.push(Prisma.sql`AND e.SERIE = ${serie}`)
  }

  if (patrimonio && patrimonio.trim() !== '') {
    filtros.push(Prisma.sql`AND e.PATRIMONIO = ${patrimonio}`)
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const chamados: any[] = await prisma.$queryRaw`
  SELECT DISTINCT
    c.id, c.SEQOS, c.CDEMPRESA, c.empresa_id,
    DATE_FORMAT(c.DTINCLUSAO, '%d/%m/%Y') AS DTINCLUSAO,
    DATE_FORMAT(STR_TO_DATE(CONCAT(c.DTPREVENTREGA, ' ', c.HRPREVENTREGA), '%Y-%m-%d %H:%i:%s'), '%d/%m/%Y %H:%i') AS PREVISAOATENDIMENTO,
    c.HRPREVENTREGA, c.HRINCLUSAO, c.DTFECHAMENTO, c.NMCLIENTE, c.DTPREVENTREGA, c.ID_BASE, c.NMSUPORTEA,
    CONCAT(DATE_FORMAT(c.DTINCLUSAO, '%d/%m/%Y'), ' ', DATE_FORMAT(c.HRINCLUSAO, '%H:%i')) AS DTHRINCLUSAO,
    c.ENDERECO, c.NUM, c.COMPLEMENTO, c.BAIRRO, c.CIDADE, c.UF, c.CEP, c.CDCLIENTE,
    c.CONTATO, CONCAT('(', c.DDD, ')', ' ', c.FONE) AS telefone, c.EMAIL,
    c.OBSDEFEITOATS, c.OBSDEFEITOCLI, c.DEPARTAMENTO, c.STATUS, c.CDSTATUS,
    e.SERIE, e.MODELO, e.DEPARTAMENTO, e.LOCALINSTAL, e.CDCLIENTEENT, e.PATRIMONIO, c.CDEQUIPAMENTO,
    d.NMDEFEITO,
    t.NMOSTP,
    STR_TO_DATE(CONCAT(c.DTPREVENTREGA, ' ', c.HRPREVENTREGA), '%Y-%m-%d %H:%i:%s') AS previsao_atendimento,
    emp.empresa_fantasia, emp.empresa_nome, c.SEQCONTRATO,
    cl.FANTASIA AS cliente_entrega_fantasia
  FROM chamados c
  INNER JOIN equipamentos e ON c.CDEQUIPAMENTO = e.CDEQUIPAMENTO AND e.ID_BASE = c.ID_BASE AND e.empresa_id = c.empresa_id
  INNER JOIN defeitos d ON d.CDDEFEITO = c.CDDEFEITO AND d.ID_BASE = c.ID_BASE
  INNER JOIN chamado_tipos t ON t.CDOSTP = c.CDOSTP AND t.ID_BASE = c.ID_BASE
  INNER JOIN empresas emp ON emp.id = c.empresa_id
  LEFT JOIN clientes cl ON e.CDCLIENTEENT = cl.CDCLIENTE AND e.ID_BASE = cl.ID_BASE AND e.empresa_id = cl.empresa_id
  WHERE c.NMSUPORTET = ${idTecnico}
    AND c.TFLIBERADO = 'S'
    AND c.ID_BASE = ${idBase}
    AND c.empresa_id IN (${Prisma.join(empresas)})
    ${filtros.length > 0 ? Prisma.join(filtros, ' ') : Prisma.empty}
  ${orderClause}
  LIMIT 21
`

  // Uma consulta para as peças de todas as OS (antes: uma por OS).
  const partsBySeqos = await getLinkedPartsBySeqosFn(
    idBase,
    chamados.map(chamado => Number(chamado.SEQOS))
  )

  const formattedData = chamados.map(chamado => {
    return {
      sequence: chamado.id,
      seqos: chamado.SEQOS,
      type: chamado.NMOSTP,
      contact: chamado.CONTATO,
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
      parts: partsBySeqos.get(Number(chamado.SEQOS)) ?? [],
    }
  })

  return formattedData
}
