import { prisma } from "../../lib/prisma";
import { BadRequest } from "../../routes/_errors/bad-request";

export async function updateOrder(
    ID_BASE: number,
    chamado_id: number,
    empresa_id: number,
    STATUS: string | null,
    CDSTATUS: string | null,
    ativo_app: number,
    followUp: string,
    dateTimeTransaction: string | null = null,
    progress: number | null = null
) {
    // Obter os dados do chamado existente
    const chamado = await prisma.chamados.findUnique({
        where: {
            id: chamado_id,
            ID_BASE,
            empresa_id
        },
    });

    if (!chamado) {
        throw new BadRequest("Chamado não encontrado para atualizar!");
    }

    let updatedData: any = {
        ativo_app
    };

    // Verifica e processa o followUp
    if (followUp && followUp.trim() !== "") {
        // Remove quebras de linha no followUp
        followUp = followUp.replace(/\n/g, "");
        updatedData.OBSDEFEITOATS = followUp;
    }

    // Verifica se deve atualizar o STATUS e CDSTATUS
    const atualizadoAppTimestamp = chamado.ATUALIZADO_APP ? new Date(chamado.ATUALIZADO_APP).getTime() : null;
    const dateTimeTransactionTimestamp = dateTimeTransaction ? new Date(dateTimeTransaction).getTime() : null;

    if (!dateTimeTransaction || dateTimeTransaction === "2000-01-01 00:00:00" || 
        !atualizadoAppTimestamp || (dateTimeTransactionTimestamp && dateTimeTransactionTimestamp > atualizadoAppTimestamp)) {

        if (STATUS !== null) {
            updatedData.STATUS = STATUS;
        }

        if (CDSTATUS !== null) {
            updatedData.CDSTATUS = CDSTATUS;
        }

        const newDatetime = dateTimeTransactionTimestamp
            ? new Date(dateTimeTransactionTimestamp).toISOString()
            : new Date().toISOString();
        updatedData.ATUALIZADO_APP = newDatetime;
    }

    // Atualiza os dados do chamado no final do atendimento (progress)
    if (progress === 30 || progress === 0) {
        updatedData.ATUALIZADO = chamado.SEQOS > 0 ? "2" : "1"; // Converte os valores para string
    }

    // Atualizar o chamado no banco de dados
    const updatedChamado = await prisma.chamados.update({
        where: {
            id: chamado_id,
            ID_BASE,
            empresa_id
        },
        data: updatedData
    });

    return updatedChamado;
}
