import { prisma } from '@/lib/prisma'

export async function getStatusFn(idEmpresa: number) {
  const status = await prisma.$queryRaw<{ NMSTATUS: string }[]>`
    SELECT
    CDSTATUS,
    NMSTATUS,
    TIPO
    FROM status
    WHERE TIPO in ('M', 'O', 'P', 'T')
      AND ID_BASE = ${idEmpresa}
      AND TFINATIVO = 'N'
  `

  return status
}
