import { prisma } from '../../lib/prisma'

export async function getLinkedParts(idBase: number, seqOs: number) {
  const query = `
    SELECT
        ci.QUANTIDADE, ci.CDPRODUTO, p.NMPRODUTO, el.NMLOCESTOQUE
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
        and ci.SEQOS = ${seqOs}
        and TF_TROCA_KIT_TECNICO = 'N'
  `

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const linkedParts = await prisma.$queryRawUnsafe<any[]>(query)

  const parts = linkedParts.map(peca => ({
    quantidade: peca.QUANTIDADE,
    cdproduto: peca.CDPRODUTO,
    nmproduto: peca.NMPRODUTO || 'Produto não especificado',
    nmlocestoque: peca.NMLOCESTOQUE || '',
  }))

  console.log('Peças vinculadas:', parts)

  return { parts }
}
