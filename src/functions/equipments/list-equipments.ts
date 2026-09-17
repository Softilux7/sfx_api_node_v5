import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

type ContractFilter = 'with' | 'without' | ''

type ListEquipmentsFilters = {
  idBase: number
  contrato?: ContractFilter
  nmcliente?: string
  patrimonio?: string
  serie?: string
  cdequipamento?: number
  limit?: number
}

type RawEquipmentRow = {
  id: number
  seqcontrato: number | null
  cdequipamento: number | null
  cdcliente: number | null
  cdproduto: string | null
  empresaId: number
  serie: string | null
  fabricante: string | null
  modelo: string | null
  patrimonio: string | null
  departamento: string | null
  localinstal: string | null
  // Endereço de instalação: fica na própria tabela `equipamentos` e é onde o técnico atende.
  inst_endereco: string | null
  inst_num: number | null
  inst_complemento: string | null
  inst_bairro: string | null
  inst_cidade: string | null
  inst_uf: string | null
  inst_cep: string | null
  inst_contato: string | null
  inst_ddd: string | null
  inst_fone: string | null
  cliente_id: number | null
  cliente_empresa_id: number | null
  cliente_nmcliente: string | null
  cliente_fantasia: string | null
  cliente_bairro: string | null
  cliente_endereco: string | null
  cliente_fone1: string | null
  cliente_cidade: string | null
  cliente_complemento: string | null
  cliente_num: number | null
  cliente_uf: string | null
  cliente_cep: string | null
  contrato_id: number | null
  contrato_id_base: number | null
  contrato_empresa_id: number | null
  contrato_id_contrato: number | null
  contrato_seqcontrato: number | null
  contrato_nrcontrato: string | null
  contrato_status: string | null
}

export async function listEquipmentsFn(filters: ListEquipmentsFilters) {
  const {
    idBase,
    contrato = '',
    nmcliente,
    patrimonio,
    serie,
    cdequipamento,
    limit,
  } = filters

  const limitValue =
    typeof limit === 'number' && Number.isFinite(limit) && limit > 0
      ? Math.floor(limit)
      : 30

  const filtersSql: Prisma.Sql[] = [Prisma.sql`e.ID_BASE = ${idBase}`]

  const contractFilter = contrato ?? ''

  if (contractFilter === 'with') {
    filtersSql.push(Prisma.sql`ct.id IS NOT NULL`)
  }

  if (contractFilter === 'without') {
    filtersSql.push(Prisma.sql`ct.id IS NULL`)
  }

  if (nmcliente && nmcliente.trim() !== '') {
    filtersSql.push(Prisma.sql`cli.NMCLIENTE LIKE ${`%${nmcliente.trim()}%`}`)
  }

  if (patrimonio && patrimonio.trim() !== '') {
    filtersSql.push(Prisma.sql`e.PATRIMONIO LIKE ${`%${patrimonio.trim()}%`}`)
  }

  if (serie && serie.trim() !== '') {
    filtersSql.push(Prisma.sql`e.SERIE LIKE ${`%${serie.trim()}%`}`)
  }

  if (
    typeof cdequipamento === 'number' &&
    Number.isFinite(cdequipamento) &&
    cdequipamento !== 0
  ) {
    filtersSql.push(Prisma.sql`e.CDEQUIPAMENTO = ${cdequipamento}`)
  }

  const whereSql = Prisma.join(filtersSql, ' AND ')

  const baseQuery = Prisma.sql`
    FROM equipamentos e
    LEFT JOIN clientes cli
      ON cli.CDCLIENTE = e.CDCLIENTE
      AND cli.ID_BASE = e.ID_BASE
      AND cli.empresa_id = e.empresa_id
    LEFT JOIN contratos ct
      ON ct.SEQCONTRATO = e.SEQCONTRATO
      AND ct.ID_BASE = e.ID_BASE
      AND (ct.empresa_id = e.empresa_id OR ct.empresa_id IS NULL)
    WHERE ${whereSql}
  `

  const equipamentos = await prisma.$queryRaw<RawEquipmentRow[]>(
    Prisma.sql`
      SELECT
        e.id,
        e.SEQCONTRATO AS seqcontrato,
        e.CDEQUIPAMENTO AS cdequipamento,
        e.CDCLIENTE AS cdcliente,
        e.CDPRODUTO AS cdproduto,
        e.empresa_id AS empresaId,
        e.SERIE AS serie,
        e.FABRICANTE AS fabricante,
        e.MODELO AS modelo,
        e.PATRIMONIO AS patrimonio,
        e.DEPARTAMENTO AS departamento,
        e.LOCALINSTAL AS localinstal,
        e.ENDERECO AS inst_endereco,
        e.NUM AS inst_num,
        e.COMPLEMENTO AS inst_complemento,
        e.BAIRRO AS inst_bairro,
        e.CIDADE AS inst_cidade,
        e.UF AS inst_uf,
        e.CEP AS inst_cep,
        e.CONTATO AS inst_contato,
        e.DDD AS inst_ddd,
        e.FONE AS inst_fone,
        cli.id AS cliente_id,
        cli.empresa_id AS cliente_empresa_id,
        cli.NMCLIENTE AS cliente_nmcliente,
        cli.FANTASIA AS cliente_fantasia,
        cli.BAIRRO AS cliente_bairro,
        cli.ENDERECO AS cliente_endereco,
        cli.FONE1 AS cliente_fone1,
        cli.CIDADE AS cliente_cidade,
        cli.COMPLEMENTO AS cliente_complemento,
        cli.NUM AS cliente_num,
        cli.UF AS cliente_uf,
        cli.CEP AS cliente_cep,
        ct.id AS contrato_id,
        ct.ID_BASE AS contrato_id_base,
        ct.empresa_id AS contrato_empresa_id,
        ct.ID_CONTRATO AS contrato_id_contrato,
        ct.SEQCONTRATO AS contrato_seqcontrato,
        ct.NRCONTRATO AS contrato_nrcontrato,
        ct.STATUS AS contrato_status
      ${baseQuery}
      ORDER BY e.id DESC
      LIMIT ${limitValue}
    `
  )

  return equipamentos.map(row => ({
    id: row.id,
    seqcontrato: row.seqcontrato !== null ? String(row.seqcontrato) : null,
    cdequipamento: row.cdequipamento ?? 0,
    cdcliente: row.cdcliente ?? 0,
    cdproduto: row.cdproduto ?? '',
    empresaId: row.empresaId,
    serie: row.serie ?? '',
    fabricante: row.fabricante ?? '',
    modelo: row.modelo ?? '',
    patrimonio: row.patrimonio ?? '',
    departamento: row.departamento ?? '',
    localinstal: row.localinstal ?? '',
    // Endereço onde o equipamento está instalado. O app usa este como principal e só
    // recorre ao do cliente quando o cadastro do equipamento está em branco.
    instalacao: {
      endereco: row.inst_endereco ?? '',
      num: row.inst_num ?? 0,
      complemento: row.inst_complemento ?? '',
      bairro: row.inst_bairro ?? '',
      cidade: row.inst_cidade ?? '',
      uf: row.inst_uf ?? '',
      cep: row.inst_cep ?? '',
      contato: row.inst_contato ?? '',
      ddd: row.inst_ddd ?? '',
      fone: row.inst_fone ?? '',
    },
    cliente:
      row.cliente_id !== null
        ? {
            id: row.cliente_id,
            empresaId: row.cliente_empresa_id ?? 0,
            nmcliente: row.cliente_nmcliente ?? '',
            fantasia: row.cliente_fantasia ?? '',
            bairro: row.cliente_bairro ?? '',
            endereco: row.cliente_endereco ?? '',
            fone1: row.cliente_fone1 ?? '',
            cidade: row.cliente_cidade ?? '',
            complemento: row.cliente_complemento ?? '',
            num: row.cliente_num ?? 0,
            uf: row.cliente_uf ?? '',
            cep: row.cliente_cep ?? '',
          }
        : null,
    contrato:
      row.contrato_id !== null
        ? {
            id: row.contrato_id,
            idBase: row.contrato_id_base ?? 0,
            empresaId: row.contrato_empresa_id ?? 0,
            idContrato: row.contrato_id_contrato ?? 0,
            seqcontrato: row.contrato_seqcontrato ?? 0,
            nrcontrato: row.contrato_nrcontrato ?? '',
            status: row.contrato_status ?? '',
          }
        : null,
  }))
}
