import { prisma } from '../../lib/prisma'

export async function getLinkedParts(idBase: number, seqOs: number) {
  const query = `
    SELECT
        ci.QUANTIDADE, ci.CDPRODUTO, p.NMPRODUTO 
    FROM
        chamados_itens ci
    INNER JOIN produtos p ON
        p.ID_BASE = ci.ID_BASE
        and p.CDPRODUTO = ci.CDPRODUTO
    WHERE
        ci.ID_BASE = ${idBase}
        and ci.SEQOS = ${seqOs}
  `

  const linkedParts = await prisma.$queryRawUnsafe<any[]>(query)

  const parts = linkedParts.map(peca => ({
    quantidade: peca.QUANTIDADE,
    cdproduto: peca.CDPRODUTO,
    nmproduto: peca.NMPRODUTO || 'Produto não especificado',
  }))

  return { parts }
}
