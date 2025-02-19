import { BadRequest } from "../routes/_errors/bad-request";
import { prisma } from "../lib/prisma";

export async function updateAttendance(
    id: number,
    ID_BASE: number,
    progress: number,
    params: {
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
                throw new BadRequest('Não foi possível atualizar o progresso [5]')
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
            const pauseInAttendace = prisma.atendimentos.update({
                where: {
                    id,
                    ID_BASE,
                },
                data: {
                    ANDAMENTO_CHAMADO_APP: 7,
                }
            })

            if (!pauseInAttendace) {
                throw new BadRequest('Não foi possível atualizar o progresso [7]')
            }

            return pauseInAttendace;

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
            const formAttendance = prisma.atendimentos.update({
                where: {
                    id,
                    ID_BASE,
                },
                data: {
                    OBSERVACAO: params.OBSERVACAO,
                    SINTOMA: params.SINTOMA,
                    CAUSA: params.CAUSA,
                    ACAO: params.ACAO,
                    VALESTACIONAMENTO: params.VALESTACIONAMENTO,
                    VALPEDAGIO: params.VALPEDAGIO,
                    VALOUTRASDESP: params.VALOUTRASDESP,
                    NOME_CONTATO: params.NOME_CONTATO,
                    CDMEDIDOR: params.CDMEDIDOR,
                    MEDIDOR: params.MEDIDOR,
                    HRVIAGEMFIN: params.HRVIAGEMFIN,
                    HRATENDIMENTOFIN: params.HRATENDIMENTOFIN,
                    ANDAMENTO_CHAMADO_APP: 10,
                }
            })
            console.log(formAttendance, "## CASE FINALIZAR FORMULÁRIO ##")

            if (!formAttendance) {
                throw new BadRequest('Não foi possível atualizar o progresso [10]')
            }

            return formAttendance;

        case 11:
            // Assinatura concluída
            break;

        case 15:
            // Atendimento Cancelado
            break;

        case 30:
            // Consulta os dados do atendimento e do técnico em uma única requisição
            // const attendance = await prisma.atendimentos.findUnique({
            //     where: { id, ID_BASE },
            //     select: {
            //         NMATENDENTE: true,
            //         KMFINAL: true,
            //         KMINICIAL: true,
            //         HRVIAGEMINI: true,
            //         HRVIAGEMFIN: true,
            //         TEMPOATENDIMENTO: true,
            //         DESLOCAMENTO_APP: true
            //     }
            // });

            // if (!attendance) {
            //     throw new Error("Atendimento não encontrado");
            // }

            // const { KMFINAL, KMINICIAL, HRVIAGEMINI, HRVIAGEMFIN, NMATENDENTE, TEMPOATENDIMENTO, DESLOCAMENTO_APP } = attendance;

            // if (!HRVIAGEMINI || !HRVIAGEMFIN) {
            //     throw new Error("Horário de viagem inválido");
            // }
            // if (!NMATENDENTE) {
            //     throw new Error("Técnico sem nome");
            // }

            // // Calcula o tempo de viagem
            // const travelTime = getTimeService(HRVIAGEMINI, HRVIAGEMFIN);
            // const hours = String(Math.floor(travelTime / 60)).padStart(2, "0");
            // const minutes = String(travelTime % 60).padStart(2, "0");
            // const TEMPOVIAGEM = `${hours}:${minutes}`;

            // // Define os valores de KM
            // const kmFinal = KMFINAL ?? 0;
            // const kmInicial = KMINICIAL ?? 0;

            // // Consulta os dados do técnico
            // const tecnico = await prisma.tecnicos.findFirst({
            //     where: {
            //         NMSUPORTE: NMATENDENTE,
            //         ID_BASE,
            //     },
            //     select: {
            //         VALHRATENDIMENTO: true,
            //         VALKMATENDIMENTO: true,
            //         TFCOBRARHRCHEIA: true,
            //         TFCOBRARTEMPOVIAGEM: true,
            //         CDFORNECEDOR: true
            //     }
            // });

            // if (!tecnico) {
            //     throw new Error("Técnico não encontrado");
            // }

            // // Somente para técnicos não terceirizados
            // if (!tecnico.CDFORNECEDOR || tecnico.CDFORNECEDOR <= 0) {
            //     if (tecnico.VALHRATENDIMENTO && tecnico.VALKMATENDIMENTO) {
            //         let timeService = TEMPOATENDIMENTO ?? 0;

            //         // Verifica se é para cobrar hora cheia
            //         if (tecnico.TFCOBRARHRCHEIA === 'S') {
            //             timeService = Math.ceil(timeService / 60) * 60;
            //         }

            //         // Verifica se é para cobrar tempo de viagem
            //         if (tecnico.TFCOBRARTEMPOVIAGEM === 'S') {
            //             timeService += travelTime;
            //         }

            //         // Calcula o valor do atendimento
            //         const VALATENDIMENTO = Math.round(timeService * (tecnico.VALHRATENDIMENTO / 60) * 100) / 100;
            //         let VALKM = 0;

            //         // Se deslocamento for pelo app, calcula quilometragem
            //         if (DESLOCAMENTO_APP === 1) {
            //             VALKM = Math.round((kmFinal - kmInicial) * tecnico.VALKMATENDIMENTO * 100) / 100;
            //         }
            //     }
            // }

            // const update = prisma.atendimentos.update({
            //     where: {
            //         id,
            //         ID_BASE,
            //     },
            //     data: {
            //         TEMPOVIAGEM,
            //         VALATENDIMENTO,
            //         VALKM,
            //         KMFINAL,
            //         ANDAMENTO_CHAMADO_APP: 30,
            //     }
            // })
            // console.log(update, "## CASE FINALIZAR FORMULÁRIO ##")

            // if (!update) {
            //     throw new BadRequest('Não foi possível atualizar o progresso [10]')
            // }

            // return update;


        default:
            throw new BadRequest('Progresso inválido.');
    }

}