import { prisma } from '../lib/prisma';
import { getCompaniesByTechnical } from './get-companies-technical-repositorie';

export async function getResumoChamadosRepository(tecnicoId: string, idBase: number) {
    // Obtém as empresas vinculadas ao técnico
    const empresas = await getCompaniesByTechnical(tecnicoId, idBase);

    if (empresas.length === 0) {
        return { success: false, message: 'Nenhuma empresa encontrada para o técnico fornecido.' };
    }

    // Converte o array de empresas para uma string formatada para SQL (ex: "1,2,3")
    const empresasIds = empresas.join(',');

    // Consulta os chamados
    const resumoChamados = await prisma.$queryRaw<{ STATUS: string; total: number }[]>`
        SELECT STATUS, COUNT(*) AS total
        FROM chamados
        WHERE ID_BASE = ${idBase}
          AND empresa_id IN (${empresasIds}) 
          AND TFLIBERADO = 'S'
          AND NMSUPORTET = ${tecnicoId}
        GROUP BY STATUS`;

    console.log(resumoChamados, "## RESUMO CHAMADOS ##");

    // Mapeia os STATUS para o formato desejado e converte BigInt para Number
    const result = resumoChamados.reduce((acc, chamado) => {
        if (chamado.STATUS !== null) {
            acc[chamado.STATUS] = Number(chamado.total); 
        }
        return acc;
    }, {} as Record<string, number>);

    return result;
}