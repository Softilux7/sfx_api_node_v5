import { prisma } from '../lib/prisma';

export async function getStatusRepository(type: string, idEmpresa: number) {
  const status = await prisma.$queryRaw<{ NMSTATUS: string }[]>`
    SELECT 
    CDSTATUS,
    NMSTATUS,
    TIPO    
    FROM status 
    WHERE TIPO = ${type} 
      AND ID_BASE = ${idEmpresa} 
      AND TFINATIVO = 'N'
  `;

  if (status.length > 0) {
    return { success: true, data: status }; // Retorna o primeiro registro encontrado
  }

  return { success: false, data: [] }; // Nenhum registro encontrado
}