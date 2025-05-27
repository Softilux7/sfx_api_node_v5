import { prisma } from '../../lib/prisma'

export async function getLinkedParts(idBase: number, seqOs: number) {
  const linkedParts = await prisma.chamados_itens.findMany({
    where: {
      ID_BASE: idBase,
      SEQOS: seqOs,
      TFPENDENTE: 'S',
    },
    select: {
      QUANTIDADE: true,
      CDPRODUTO: true,
      produtos: {
        select: {
          NMPRODUTO: true,
        },
      },
    },
  })

  if (!linkedParts || linkedParts.length === 0) {
    return []
  }

  // Mapeamento das peças vinculadas
  const parts = linkedParts.map(peca => ({
    quantidade: peca.QUANTIDADE,
    cdproduto: peca.CDPRODUTO,
    nmproduto: peca.produtos?.NMPRODUTO || 'Produto não especificado',
  }))

  return { parts }
}
