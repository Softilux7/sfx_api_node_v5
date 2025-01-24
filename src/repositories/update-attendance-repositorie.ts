import { BadRequest } from "../routes/_errors/bad-request";
import { prisma } from "../lib/prisma";

export async function updateAttendance(
    id: number,
    ID_BASE: number,
    progress: number,
    params: {
        VALFINANCEIRO?: string | undefined;
        QUILOMETRAGEM?: number | undefined;
        HRATENDIMENTOFIN?: string | undefined;
        HRATENDIMENTO?: string | undefined;
        TEMPOATENDIMENTO?: number | undefined;
        DTVIAGEMFIN?: Date | undefined;
        DTVIAGEMINI?: Date | undefined;
        HRVIAGEMINI?: string | undefined;
        HRVIAGEMFIN?: string | undefined;
        DESLOCAMENTO_APP?: number | undefined;
        KMFINAL?: number | undefined;
    }
) {

    // Lógica para diferentes etapas do progresso
    switch (progress) {
        case 2:
            // Começar viagem
            const startTrip = prisma.atendimentos.update({
                where: {
                   id,
                   ID_BASE,
                },
                data: {
                    ANDAMENTO_CHAMADO_APP: 2,
                    HRVIAGEMINI: params.HRVIAGEMINI,
                }
            })

            if (!startTrip) {
                throw new BadRequest('Não foi possível atualizar o progresso [2]')
            }

            return startTrip;

        case 3:
            // PAUSA -  Antes de chegar cliente
            const pauseBeforeClient = prisma.atendimentos.update({
                where: {
                   id,
                   ID_BASE,
                },
                data: {
                    ANDAMENTO_CHAMADO_APP: 3,
                }
            })

            if (!pauseBeforeClient) {
                throw new BadRequest('Não foi possível atualizar o progresso [3]')
            }
            break;

        case 4:
            // Chegada cliente
            const arrivalTrip = prisma.atendimentos.update({
                where: {
                   id,
                   ID_BASE,
                },
                data: {
                    ANDAMENTO_CHAMADO_APP: 4,
                    DTVIAGEMFIN: params.DTVIAGEMFIN,
                    HRVIAGEMFIN: params.HRVIAGEMFIN,
                    KMFINAL: params.KMFINAL
                }
            })
            console.log(arrivalTrip, "## CASE CHEGADA CLIENTE ##")

            if (!arrivalTrip) {
                throw new BadRequest('Não foi possível atualizar o progresso [4]')
            }

            return arrivalTrip;

        case 5:
            // PAUSA
            const pauseAfterClient = prisma.atendimentos.update({
                where: {
                   id,
                   ID_BASE,
                },
                data: {
                    ANDAMENTO_CHAMADO_APP: 5,
                }
            })

            if (!pauseAfterClient) {
                throw new BadRequest('Não foi possível atualizar o progresso [3]')
            }

            return pauseAfterClient;

        case 6:
            // Em atendimento
            const inAttendace = prisma.atendimentos.update({
                where: {
                   id,
                   ID_BASE,
                },
                data: {
                    ANDAMENTO_CHAMADO_APP: 6,
                    HRATENDIMENTO: params.HRATENDIMENTO,
                }
            })
            console.log(inAttendace, "## CASE INICIAR ATENDIMENTO ##")

            if (!inAttendace) {
                throw new BadRequest('Não foi possível atualizar o progresso [6]')
            }

            return inAttendace;

        case 7:
            // PAUSA
            break;

        case 8:
            // Atendimento finalizado
            const finishAttendace = prisma.atendimentos.update({
                where: {
                   id,
                   ID_BASE,
                },
                data: {
                    ANDAMENTO_CHAMADO_APP: 8,
                }
            })
            console.log(finishAttendace, "## CASE FINALIZAR ATENDIMENTO ##")

            if (!finishAttendace) {
                throw new BadRequest('Não foi possível atualizar o progresso [8]')
            }

            return finishAttendace;

        case 10:
            // Formulário finalizado
            break;

        case 11:
            // Assinatura concluída
            break;

        case 15:
            // Atendimento Cancelado
            break;

        default:
            throw new BadRequest('Progresso inválido.');
    }

}