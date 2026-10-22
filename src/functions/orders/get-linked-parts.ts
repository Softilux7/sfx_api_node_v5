import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

type LinkedPartRow = {
  SEQOS: number
  QUANTIDADE: number
  CDPRODUTO: string
  NMPRODUTO: string | null
  NMLOCESTOQUE: string | null
}

export type LinkedPart = {
  quantidade: number
  cdproduto: string
  nmproduto: string
  nmlocestoque: string
}

function linkedPartsQuery(idBase: number, seqOsList: number[]) {
  return prisma.$queryRaw<LinkedPartRow[]>`
    SELECT
        ci.SEQOS, ci.QUANTIDADE, ci.CDPRODUTO, p.NMPRODUTO, el.NMLOCESTOQUE
    FROM
        chamados_itens ci
    INNER JOIN produtos p ON
        p.ID_BASE = ci.ID_BASE
        and p.CDPRODUTO = ci.CDPRODUTO
    LEFT JOIN estoque_local el ON
        el.ID_BASE = ci.ID_BASE
        and el.CDLOCESTOQUE = ci.CDLOCESTOQUE
    WHERE
        ci.ID_BASE = ${idBase}
        and ci.SEQOS IN (${Prisma.join(seqOsList)})
        and TF_TROCA_KIT_TECNICO = 'N'
  `
}

function toLinkedPart(peca: LinkedPartRow): LinkedPart {
  return {
    quantidade: peca.QUANTIDADE,
    cdproduto: peca.CDPRODUTO,
    nmproduto: peca.NMPRODUTO || 'Produto não especificado',
    nmlocestoque: peca.NMLOCESTOQUE || '',
  }
}

export async function getLinkedPartsFn(idBase: number, seqOs: number) {
  const linkedParts = await linkedPartsQuery(idBase, [seqOs])

  return { parts: linkedParts.map(toLinkedPart) }
}

/**
 * Peças de várias OS da mesma base numa consulta só, agrupadas por SEQOS. A lista de chamados
 * fazia uma consulta por OS (até 21 por requisição).
 */
export async function getLinkedPartsBySeqosFn(
  idBase: number,
  seqOsList: number[]
): Promise<Map<number, LinkedPart[]>> {
  const bySeqos = new Map<number, LinkedPart[]>()
  const unique = [...new Set(seqOsList)]
  if (unique.length === 0) return bySeqos

  const linkedParts = await linkedPartsQuery(idBase, unique)

  for (const peca of linkedParts) {
    const seqos = Number(peca.SEQOS)
    const list = bySeqos.get(seqos) ?? []
    list.push(toLinkedPart(peca))
    bySeqos.set(seqos, list)
  }

  return bySeqos
}
