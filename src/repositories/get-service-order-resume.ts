import { prisma } from '../lib/prisma';
import { getCompaniesByTechnical } from './get-companies-technical-repositorie';
import { Prisma } from '@prisma/client';

export async function getResumoChamadosRepository(tecnicoId: string, idBase: number) {
    // Obtém as empresas vinculadas ao técnico
    const empresas = await getCompaniesByTechnical(tecnicoId, idBase);

    // Verifica se alguma empresa foi encontrada
    if (empresas.length === 0) {
        return { success: false, message: 'Nenhuma empresa encontrada para o técnico fornecido.' };
    }

    // Cria um array de placeholders para o IN()
    const empresasList = Prisma.join(empresas);

    // Consulta os chamados
    const resumoChamados = await prisma.$queryRaw<{ STATUS: string; total: number }[]>(
        Prisma.sql`
        SELECT STATUS, COUNT(*) AS total
        FROM chamados
        WHERE ID_BASE = ${idBase}
          AND empresa_id IN (${empresasList})
          AND TFLIBERADO = 'S'
          AND NMSUPORTET = ${tecnicoId}
        GROUP BY STATUS`
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
