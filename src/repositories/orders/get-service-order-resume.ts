import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { getCompaniesByTechnical } from '../companies/get-companies-technical-repositorie';

export async function getResumoChamadosRepository(tecnicoId: string, idBase: number) {
    // Obtém as empresas vinculadas ao técnico
    const empresas = await getCompaniesByTechnical(tecnicoId, idBase);

    // Verifica se alguma empresa foi encontrada
    if (empresas.length === 0) {
        return { success: false, message: 'Nenhuma empresa encontrada para o técnico fornecido.' };
    }

    // Consulta os chamados
    const resumoChamados = await prisma.$queryRaw<{ STATUS: string; total: number }[]>(
        Prisma.sql`
        SELECT STATUS, COUNT(*) AS total
        FROM chamados
        WHERE ID_BASE = ${idBase}
          AND empresa_id IN (${Prisma.join(empresas)})
          AND TFLIBERADO = 'S'
          AND NMSUPORTET = ${tecnicoId}
        GROUP BY STATUS
        ORDER BY total DESC
        LIMIT 30`
    );

    // Mapeia os STATUS para o formato desejado e converte BigInt para Number
    const result = resumoChamados.reduce((acc, chamado) => {
        if (chamado.STATUS !== null) {
            acc[chamado.STATUS] = Number(chamado.total); 
        }
        return acc;
    }, {} as Record<string, number>);

    return result;
}
