import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getCompaniesByTechnical } from '../companies/get-companies-by-technical'

export async function getResumoChamadosFn(tecnicoId: string, idBase: number) {
  const empresas = await getCompaniesByTechnical(tecnicoId, idBase)

  if (empresas.length === 0) {
    return {
      success: false,
      message: 'Nenhuma empresa encontrada para o técnico fornecido.',
    }
  }

  const resumoChamados = await prisma.$queryRaw<
    { status: string; amount: bigint }[]
  >(
    Prisma.sql`
      SELECT chamados.STATUS as status, COUNT(chamados.STATUS) AS amount
      FROM chamados
      INNER JOIN equipamentos
        ON chamados.CDEQUIPAMENTO = equipamentos.CDEQUIPAMENTO
        AND equipamentos.ID_BASE = chamados.ID_BASE
      INNER JOIN defeitos
        ON defeitos.CDDEFEITO = chamados.CDDEFEITO
        AND defeitos.ID_BASE = chamados.ID_BASE
      WHERE chamados.ID_BASE = ${idBase}
        AND chamados.empresa_id IN (${Prisma.join(empresas)})
        AND chamados.TFLIBERADO = 'S'
        AND chamados.NMSUPORTET = ${tecnicoId}
      GROUP BY chamados.STATUS
    `
  )

  const result = resumoChamados.reduce(
    (acc, chamado) => {
      if (chamado.status !== null) {
        acc[chamado.status] = Number(chamado.amount)
      }
      return acc
    },
    {} as Record<string, number>
  )

  return result
}
