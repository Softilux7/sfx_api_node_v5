import { BadRequest } from "../routes/_errors/bad-request";
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";

export async function updateAttendance(
    id: number,
    ID_BASE: number,
    progress: number,
    params: {
        KMINICIAL?: number | undefined;
        ID_TECNICO?: string | undefined;
        VALFINANCEIRO?: string | undefined;
        VALESTACIONAMENTO?: number | undefined;
        VALPEDAGIO?: number | undefined;
        VALOUTRASDESP?: number | undefined;
        QUILOMETRAGEM?: number | undefined;
        CDMEDIDOR?: string | undefined;
        MEDIDOR?: number | undefined;
        HRATENDIMENTOFIN?: string | undefined;
        HRATENDIMENTO?: string | undefined;
        TEMPOATENDIMENTO?: number | undefined;
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
    }
) {

    // Lógica para diferentes etapas do progresso
    switch (progress) {
        case 2:

        //## COMEÇAR VIAGEM ##
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

            console.log(updatedInAttendance[0], "## CASE INICIAR ATENDIMENTO ##");

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

            console.log(updatedFinishAttendance[0], "## CASE FINALIZAR ATENDIMENTO ##");

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
                HRVIAGEMFIN = ${params.HRVIAGEMFIN},
                HRATENDIMENTOFIN = ${params.HRATENDIMENTOFIN},
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

            // Formata os horários recebidos no padrão HH:mm:ss
            const HRATENDIMENTOINI = dayjs(params.HRATENDIMENTO).format('HH:mm:ss');
            const HRATENDIMENTOFIN = dayjs(params.HRATENDIMENTOFIN).format('HH:mm:ss');

            // Função para calcular o tempo de atendimento em minutos
            const getTimeService = (start: string, end: string) => {
                const diff = dayjs(`1970-01-01T${end}`).diff(dayjs(`1970-01-01T${start}`), 'minute');
                return Math.max(0, diff); // Evita valores negativos
            };

            const TEMPOATENDIMENTO = getTimeService(HRATENDIMENTOINI, HRATENDIMENTOFIN);

            // Atualiza a tabela atendimentos
            await prisma.$executeRaw`
                UPDATE atendimentos
                SET 
                    HRATENDIMENTOINI = ${HRATENDIMENTOINI},
                    HRATENDIMENTOFIN = ${HRATENDIMENTOFIN},
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
            break;

        case 30:
        // Formata os horários de início e fim da viagem no formato HH:mm:ss
        const HRVIAGEMINI = dayjs(params.HRVIAGEMINI).format('HH:mm:ss');
        const HRVIAGEMFIN = dayjs(params.HRVIAGEMFIN).format('HH:mm:ss');

        // Função para calcular o tempo de viagem e formatar como HH:mm
        const getTimeServiceFormatted = (start: string, end: string) => {
            const diffMinutes = dayjs(`1970-01-01T${end}`).diff(dayjs(`1970-01-01T${start}`), 'minute');
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        };

        const TEMPOVIAGEM = getTimeServiceFormatted(HRVIAGEMINI, HRVIAGEMFIN);

        // Busca informações do técnico para cálculo do valor do atendimento
        const tecnico = await prisma.$queryRaw`
            SELECT TARIFA_HORA, COBRANCA_HORA_CHEIA, COBRANCA_TEMPO_VIAGEM, VALOR_KM
            FROM tecnicos
            WHERE ID_TECNICO = ${params.ID_TECNICO}
        `;

        if (!tecnico) {
            throw new BadRequest('Não foi possível obter informações do técnico.');
        }

        const { TARIFA_HORA, COBRANCA_HORA_CHEIA, COBRANCA_TEMPO_VIAGEM, VALOR_KM } = tecnico;

        // Calcula o valor do atendimento
        let VALATENDIMENTO = 0;
        if (COBRANCA_HORA_CHEIA || COBRANCA_TEMPO_VIAGEM) {
            const tempoAtendimentoMinutos = dayjs(`1970-01-01T${params.TEMPOATENDIMENTO}`).diff(dayjs('1970-01-01T00:00:00'), 'minute');
            const horasCobradas = COBRANCA_HORA_CHEIA ? Math.ceil(tempoAtendimentoMinutos / 60) : tempoAtendimentoMinutos / 60;
            VALATENDIMENTO = horasCobradas * TARIFA_HORA;
        }

        // Calcula o valor da quilometragem, se aplicável
        let VALKM = 0;
        if (params.KMINICIAL && params.KMFINAL && VALOR_KM) {
            const distancia = Math.max(0, params.KMFINAL - params.KMINICIAL);
            VALKM = distancia * VALOR_KM;
        }

        // Atualiza a tabela atendimentos com os valores calculados
        const concludeAttendance = await prisma.$queryRaw`
            UPDATE atendimentos
            SET HRVIAGEMINI = ${HRVIAGEMINI},
                HRVIAGEMFIN = ${HRVIAGEMFIN},
                TEMPOVIAGEM = ${TEMPOVIAGEM},
                VALATENDIMENTO = ${VALATENDIMENTO},
                VALKM = ${VALKM},
                ANDAMENTO_CHAMADO_APP = 30
            WHERE id = ${id} AND ID_BASE = ${ID_BASE}
        `;

        console.log(concludeAttendance, "## PROGRESSO 30 ATUALIZADO ##");

        if (!concludeAttendance) {
            throw new BadRequest('Não foi possível atualizar o progresso [30]');
        }

        return concludeAttendance;


        default:
            throw new BadRequest('Progresso inválido.');
    }

}