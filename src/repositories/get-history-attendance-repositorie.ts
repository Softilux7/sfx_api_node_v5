import { prisma } from '../lib/prisma';

export async function getAttendanceHistory(ID_BASE: number, idChamado: number) {
    const attendanceDetails = await prisma.$queryRaw<
        {  
            id: number;
            NMATENDENTE: string;
            dt_atendimento: string;
            hr_ini: string;
            hr_fim: string;
            CAUSA: string;
            SINTOMA: string;
            ACAO: string;
            SEQOS: number;
            OBSERVACAO: string;
            OBSDEFEITOATS: string;
            NMDEFEITO: string;
            ANDAMENTO_CHAMADO_APP: number;
        }[]
    >`
        SELECT 
            a.id,
            a.NMATENDENTE, 
            DATE_FORMAT(a.DTATENDIMENTO, '%d/%m/%Y') AS dt_atendimento,
            DATE_FORMAT(a.HRATENDIMENTO, '%H:%i') AS hr_ini, 
            DATE_FORMAT(a.HRATENDIMENTOFIN, '%H:%i') AS hr_fim,
            a.CAUSA, 
            a.SINTOMA, 
            a.ACAO, 
            a.SEQOS, 
            a.OBSERVACAO, 
            c.OBSDEFEITOATS, 
            d.NMDEFEITO, 
            a.ANDAMENTO_CHAMADO_APP
        FROM atendimentos a
        INNER JOIN chamados c ON c.id = a.chamado_id
        LEFT JOIN defeitos d ON d.CDDEFEITO = c.CDDEFEITO 
            AND d.empresa_id = a.empresa_id
            AND d.ID_BASE = a.ID_BASE
        WHERE a.chamado_id = ${idChamado}
            AND a.ID_BASE = ${ID_BASE}
            AND a.ANDAMENTO_CHAMADO_APP <> 15
        ORDER BY a.id DESC
    `;
    
    return attendanceDetails;
}