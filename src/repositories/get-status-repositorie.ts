import { prisma } from '../lib/prisma';

export async function getStatusRepository(type: string, idEmpresa: number, idBase: number) {
  const status = await prisma.$queryRaw<{ NMSTATUS: string }[]>`
    SELECT 
    CDSTATUS,
    NMSTATUS 
    FROM status 
    WHERE TIPO = ${type} 
      AND empresa_id = ${idEmpresa} 
      AND ID_BASE = ${idBase} 
      AND TFINATIVO = 'N'
  `;

  if (status.length > 0) {
    return { success: true, data: status }; // Retorna o primeiro registro encontrado
  }

  return { success: false, data: [] }; // Nenhum registro encontrado
}