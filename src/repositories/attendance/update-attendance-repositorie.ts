import dayjs from "dayjs";
import { calcularAtendimentoCaso30 } from "../../functions/calc-attendance";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../routes/_errors/bad-request";

export async function updateAttendance(
    id: number,
    ID_BASE: number,
    progress: number,
    params: {
        KMINICIAL?: number | undefined;
        VALESTACIONAMENTO?: number | undefined;
        VALPEDAGIO?: number | undefined;
        VALOUTRASDESP?: number | undefined;
        CDMEDIDOR?: string | undefined;
        MEDIDOR?: number | undefined;
        HRATENDIMENTOFIN?: string | undefined;
        HRATENDIMENTO?: string | undefined;
        DTVIAGEMFIN?: Date | undefined;
        DTVIAGEMINI?: Date | undefined;
        HRVIAGEMINI?: string | undefined;
        HRVIAGEMFIN?: string | undefined;
        DESLOCAMENTO_APP?: number | undefined;
        KMFINAL?: number | undefined;
        OBSERVACAO?: string | undefined;
        SINTOMA?: string | undefined;
        ACAO?: string | undefined;
        CAUSA?: string | undefined;
        NOME_CONTATO?: string | undefined;
        CDSTATUS?: string | undefined;
        STATUS?: string | undefined;
        SEQOS?: number | undefined
        DESTINO_POS_ATENDIMENTO_APP?: number | undefined
    }
) {

    // Lógica para diferentes etapas do progresso
    switch (progress) {
        case 2:

        // Começar viagem
        await prisma.$executeRaw`
        UPDATE atendimentos
        SET ANDAMENTO_CHAMADO_APP = 2, HRVIAGEMINI = ${params.HRVIAGEMINI}
        WHERE id = ${id} AND ID_BASE = ${ID_BASE}`;
        
        // Seleciona o atendimento atualizado
        const updatedAtendimento: any[] = await prisma.$queryRaw`
            SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}`;
        
        if (updatedAtendimento.length === 0) {
            throw new BadRequest('Não foi possível atualizar o progresso [2]');
        }
        
        return updatedAtendimento[0];

        case 3:
            // PAUSA -  Antes de chegar cliente
            const pauseBeforeClient = await prisma.$executeRaw`
                UPDATE atendimentos
                SET ANDAMENTO_CHAMADO_APP = 3
                WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `;

            if (!pauseBeforeClient) {
                throw new BadRequest('Não foi possível atualizar o progresso [3]')
            }
            break;

        case 4:
        // Chegada cliente
        await prisma.$executeRaw`
            UPDATE atendimentos
            SET 
                ANDAMENTO_CHAMADO_APP = 4,
                DTVIAGEMFIN = ${params.DTVIAGEMFIN},
                HRVIAGEMFIN = ${params.HRVIAGEMFIN},
                KMFINAL = ${params.KMFINAL}
            WHERE id = ${id} AND ID_BASE = ${ID_BASE}
        `;

        const updatedArrivalTrip: any[] = await prisma.$queryRaw`
            SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
        `;

        if (!updatedArrivalTrip || updatedArrivalTrip.length === 0) {
            throw new BadRequest('Não foi possível atualizar o progresso [4]');
        }

        console.log(updatedArrivalTrip[0], "## CHEGADA CLIENTE ##");

        return updatedArrivalTrip[0];


        case 5:
            // PAUSA
            const pauseAfterClient = await prisma.$queryRaw`
                UPDATE atendimentos
                SET ANDAMENTO_CHAMADO_APP = 5
                WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `;

            if (!pauseAfterClient) {
                throw new BadRequest('Não foi possível atualizar o progresso [5]');
            }

            return pauseAfterClient;

        case 6:
            // Em Atendimento
            await prisma.$executeRaw`
                UPDATE atendimentos
                SET ANDAMENTO_CHAMADO_APP = 6,
                    HRATENDIMENTO = ${params.HRATENDIMENTO}
                WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `;

            const updatedInAttendance: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `;

            if (updatedInAttendance.length === 0) {
                throw new BadRequest('Não foi possível atualizar o progresso [6]');
            }

            return updatedInAttendance[0];


        case 7:
            // PAUSA
            const pauseInAttendace = await prisma.$queryRaw`
                UPDATE atendimentos
                SET ANDAMENTO_CHAMADO_APP = 7
                WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `;

            console.log(pauseInAttendace, "## CASE PAUSA NO ATENDIMENTO ##");

            if (!pauseInAttendace) {
                throw new BadRequest('Não foi possível atualizar o progresso [7]');
            }

            return pauseInAttendace;

        case 8:
            // Atendimento finalizado
            await prisma.$executeRaw`
                UPDATE atendimentos
                SET ANDAMENTO_CHAMADO_APP = 8
                WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `;

            const updatedFinishAttendance: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `;

            if (updatedFinishAttendance.length === 0) {
                throw new BadRequest('Não foi possível atualizar o progresso [8]');
            }

            return updatedFinishAttendance[0];

        case 10:
        // Formulário finalizado
        await prisma.$executeRaw`
            UPDATE atendimentos
            SET 
                OBSERVACAO = ${params.OBSERVACAO},
                SINTOMA = ${params.SINTOMA},
                CAUSA = ${params.CAUSA},
                ACAO = ${params.ACAO},
                VALESTACIONAMENTO = ${params.VALESTACIONAMENTO},
                VALPEDAGIO = ${params.VALPEDAGIO},
                VALOUTRASDESP = ${params.VALOUTRASDESP},
                NOME_CONTATO = ${params.NOME_CONTATO},
                CDMEDIDOR = ${params.CDMEDIDOR},
                MEDIDOR = ${params.MEDIDOR},
                ANDAMENTO_CHAMADO_APP = 10
            WHERE id = ${id} AND ID_BASE = ${ID_BASE}
        `;

        // Atualiza o status do chamado
        await prisma.$executeRaw`
            UPDATE chamados 
            SET 
                STATUS = ${params.STATUS},
                CDSTATUS = ${params.CDSTATUS}
            WHERE ID_BASE = ${ID_BASE} AND SEQOS = ${params.SEQOS}
        `;

        // Buscar os dados atualizados
        const updatedFormAttendance: any[] = await prisma.$queryRaw`
            SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
        `;

        if (updatedFormAttendance.length === 0) {
            throw new BadRequest('Não foi possível atualizar o progresso [10]');
        }

        return updatedFormAttendance[0];

        case 11:
            // Assinatura concluída
            const response: any[] = await prisma.$queryRaw`
            SELECT HRATENDIMENTO FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `;

            if (response.length === 0) {
                throw new BadRequest('Não foi possível atualizar o progresso [10]');
            }

            // Formata os horários recebidos no padrão HH:mm:ss
            const HRATENDIMENTOINI = dayjs.utc(response[0].HRATENDIMENTO).format('HH:mm:ss');
            const HRATENDIMENTOFIN = dayjs(params.HRATENDIMENTOFIN).format('HH:mm:ss');

            const getTimeService = (start: string, end: string): number => {
                const startTime = dayjs(`1970-01-01T${start}`);
                const endTime = dayjs(`1970-01-01T${end}`);

                const diffInMinutes = endTime.diff(startTime, 'minute');
                return diffInMinutes;
            };

            const TEMPOATENDIMENTO = getTimeService(HRATENDIMENTOINI, HRATENDIMENTOFIN);

            // Atualiza a tabela atendimentos
            await prisma.$executeRaw`
                UPDATE atendimentos
                SET 
                    TEMPOATENDIMENTO = ${TEMPOATENDIMENTO},
                    ANDAMENTO_CHAMADO_APP = 11
                WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `;

            // Buscar os dados atualizados
            const updatedAttendance: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `;

            if (!updatedAttendance || updatedAttendance.length === 0) {
                throw new BadRequest('Não foi possível atualizar o progresso [11]');
            }

            return updatedAttendance[0];


        case 15:
            // Atendimento Cancelado
            //TODO: ATUALIZAR ORDEM DE SERVIÇO PARA DESPACHADO
            await prisma.$executeRaw`
            UPDATE atendimentos
            SET 
                ANDAMENTO_CHAMADO_APP = 15,
                DTVIAGEMFIN = ${params.DTVIAGEMFIN},
                HRVIAGEMFIN = ${params.HRVIAGEMFIN},
                TFVISITA = 'S'
            WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `;

            const cancelAttendance: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `;

            if (!cancelAttendance || cancelAttendance.length === 0) {
                throw new BadRequest('Não foi possível atualizar o progresso [4]');
            }

            // await prisma.$executeRaw`
            // UPDATE chamados
            // SET 
                
            //     SEQOS = ${params.SEQOS},
            //     STATUS = 'E',
            //     HRVIAGEMFIN = ${params.HRVIAGEMFIN},
            //     TFVISITA = 'S'
            // WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            // `;

            console.log(cancelAttendance[0], "## ATENDIMENTO CANCELADO ##");

            return cancelAttendance[0];

        case 30:
            try {
                // Chamar a função e aguardar os cálculos
                const { TEMPOVIAGEM, VALATENDIMENTO, VALKM } = await calcularAtendimentoCaso30(id, ID_BASE, params.KMFINAL);
        
                // Atualizar o atendimento com os novos valores calculados
                await prisma.$executeRaw`
                UPDATE atendimentos 
                SET TEMPOVIAGEM = ${TEMPOVIAGEM}, 
                    VALATENDIMENTO = ${VALATENDIMENTO}, 
                    VALKM = ${VALKM}, 
                    ANDAMENTO_CHAMADO_APP = 30 
                WHERE ID_BASE = ${ID_BASE} AND id = ${id};
                `;

                // Buscar os dados atualizados
                const updatedAttendance: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
                `;

                if (!updatedAttendance || updatedAttendance.length === 0) {
                    throw new BadRequest('Não foi possível atualizar o progresso [11]');
                }

                return updatedAttendance[0];
        
            } catch (error) {
                console.error("Erro ao calcular atendimento caso 30:", error);
            }
        break;
        
                
        default:
            throw new BadRequest('Progresso inválido.');
    }

}