import dayjs from "dayjs";
import { prisma } from "../lib/prisma";

type Atendimento = {
    NMATENDENTE: string;
    KMINICIAL: number;
    KMFINAL: number;
    HRVIAGEMINI: string;
    HRVIAGEMFIN: string;
    TEMPOATENDIMENTO: number;
    DESLOCAMENTO_APP: number;
};

type Tecnico = {
    VALHRATENDIMENTO: number;
    VALKMATENDIMENTO: number;
    TFCOBRARHRCHEIA: string;
    TFCOBRARTEMPOVIAGEM: string;
    CDFORNECEDOR: number;
};

export async function calcularAtendimentoCaso30(idAtendimento: number, idBase: number, kmFinalParam?: number) {
    // Buscar os dados do atendimento
    const atendimento = await prisma.$queryRaw<Atendimento[]>`SELECT NMATENDENTE, KMINICIAL, KMFINAL, HRVIAGEMINI, HRVIAGEMFIN, TEMPOATENDIMENTO, DESLOCAMENTO_APP FROM atendimentos WHERE id = ${idAtendimento} LIMIT 1`;

    if (!atendimento || atendimento.length === 0) {
        throw new Error("Atendimento não encontrado");
    }

    const { NMATENDENTE, KMINICIAL, KMFINAL, HRVIAGEMINI, HRVIAGEMFIN, TEMPOATENDIMENTO, DESLOCAMENTO_APP } = atendimento[0];

    // Buscar os dados do técnico
    const tecnico = await prisma.$queryRaw<Tecnico[]>`SELECT VALHRATENDIMENTO, VALKMATENDIMENTO, TFCOBRARHRCHEIA, TFCOBRARTEMPOVIAGEM, CDFORNECEDOR FROM tecnicos WHERE ID_BASE = ${idBase} AND NMSUPORTE = ${NMATENDENTE} LIMIT 1`;

    if (!tecnico || tecnico.length === 0) {
        throw new Error("Técnico não encontrado");
    }

    const { VALHRATENDIMENTO, VALKMATENDIMENTO, TFCOBRARHRCHEIA, TFCOBRARTEMPOVIAGEM, CDFORNECEDOR } = tecnico[0];

    // Apenas para técnicos não terceirizados
    if (CDFORNECEDOR > 0) {
        return { message: "Técnico terceirizado, cálculo não aplicado." };
    }

    // Calcular tempo de viagem
    const inicio = dayjs().set('hour', Number(HRVIAGEMINI.split(':')[0])).set('minute', Number(HRVIAGEMINI.split(':')[1]));
    const fim = dayjs().set('hour', Number(HRVIAGEMFIN.split(':')[0])).set('minute', Number(HRVIAGEMFIN.split(':')[1]));
    const travelTime = fim.diff(inicio, 'minute');

    const hora = String(Math.floor(travelTime / 60)).padStart(2, '0');
    const resto = String(travelTime % 60).padStart(2, '0');
    const TEMPOVIAGEM = `${hora}:${resto}`;

    let VALATENDIMENTO = 0;
    const valorMinuto = VALHRATENDIMENTO / 60; // Valor por minuto do técnico

    // Definindo total de minutos conforme a configuração
    let totalMinutos = TEMPOATENDIMENTO;
    if (TFCOBRARTEMPOVIAGEM === 'S') {
        totalMinutos += travelTime;
    }

    if (TFCOBRARHRCHEIA === 'S') {
        // Se for hora cheia, calcular o número de horas inteiras
        const horasCheias = Math.ceil(totalMinutos / 60);
        VALATENDIMENTO = horasCheias * VALHRATENDIMENTO;
    } else {
        // Cálculo proporcional
        VALATENDIMENTO = parseFloat((valorMinuto * totalMinutos).toFixed(2));
    }


    // Definir KM Final
    const kmFinal = kmFinalParam ?? KMFINAL;

    // Calcular quilometragem
    let VALKM = 0;
    if (DESLOCAMENTO_APP === 1 && KMINICIAL > 0 && kmFinal > 0) {
        VALKM = parseFloat(((kmFinal - KMINICIAL) * VALKMATENDIMENTO).toFixed(2));
    }

    return {
        TEMPOVIAGEM,
        VALATENDIMENTO,
        VALKM,
    };
}
