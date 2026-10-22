import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'

type Atendimento = {
  NMATENDENTE: string
  KMINICIAL: number
  KMFINAL: number
  HRVIAGEMINI: string | null
  HRVIAGEMFIN: string | null
  TEMPOATENDIMENTO: number | null
  DESLOCAMENTO_APP: number
}

type Tecnico = {
  VALHRATENDIMENTO: number | null
  VALKMATENDIMENTO: number | null
  TFCOBRARHRCHEIA: string
  TFCOBRARTEMPOVIAGEM: string
  CDFORNECEDOR: number | null
}

/**
 * Sem cálculo, o fechamento grava só o andamento: terceirizado não recebe pelo app, e
 * técnico sem cadastro na base não pode deixar o atendimento aberto para sempre.
 * Antes os dois casos devolviam um objeto sem os valores, o SQL saía com
 * `VALATENDIMENTO = undefined` e o fechamento nunca era gravado.
 */
export type CalculoCaso30 =
  | {
      aplicado: true
      TEMPOVIAGEM: string
      VALATENDIMENTO: number
      VALKM: number
    }
  | { aplicado: false; motivo: 'terceirizado' | 'tecnico-nao-encontrado' }

/** "HH:mm" ou "HH:mm:ss" em minutos do dia; `null` quando vazio ou inválido. */
function minutesOfDay(hora: string | null | undefined): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(hora ?? '')
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export async function calcularAtendimentoCaso30(
  idAtendimento: number,
  idBase: number,
  kmFinalParam?: number
): Promise<CalculoCaso30> {
  const atendimento = await prisma.$queryRaw<
    Atendimento[]
  >`SELECT NMATENDENTE, KMINICIAL, KMFINAL, HRVIAGEMINI, HRVIAGEMFIN, TEMPOATENDIMENTO, DESLOCAMENTO_APP FROM atendimentos WHERE id = ${idAtendimento} LIMIT 1`

  if (!atendimento || atendimento.length === 0) {
    throw new Error('Atendimento não encontrado')
  }

  const {
    NMATENDENTE,
    KMINICIAL,
    KMFINAL,
    HRVIAGEMINI,
    HRVIAGEMFIN,
    TEMPOATENDIMENTO,
    DESLOCAMENTO_APP,
  } = atendimento[0]

  const tecnico = await prisma.$queryRaw<
    Tecnico[]
  >`SELECT VALHRATENDIMENTO, VALKMATENDIMENTO, TFCOBRARHRCHEIA, TFCOBRARTEMPOVIAGEM, CDFORNECEDOR FROM tecnicos WHERE ID_BASE = ${idBase} AND NMSUPORTE = ${NMATENDENTE} LIMIT 1`

  if (!tecnico || tecnico.length === 0) {
    console.warn(
      `[caso 30] técnico "${NMATENDENTE}" não encontrado na base ${idBase}: atendimento ${idAtendimento} fechado sem cálculo`
    )
    return { aplicado: false, motivo: 'tecnico-nao-encontrado' }
  }

  const {
    VALHRATENDIMENTO,
    VALKMATENDIMENTO,
    TFCOBRARHRCHEIA,
    TFCOBRARTEMPOVIAGEM,
    CDFORNECEDOR,
  } = tecnico[0]

  if ((CDFORNECEDOR ?? 0) > 0) {
    return { aplicado: false, motivo: 'terceirizado' }
  }

  // Hora de viagem ausente (atendimento sem deslocamento ou etapa perdida) conta 0 minutos;
  // antes `null.split` derrubava o fechamento inteiro.
  const inicioMin = minutesOfDay(HRVIAGEMINI)
  const fimMin = minutesOfDay(HRVIAGEMFIN)
  const inicio = dayjs()
    .set('hour', Math.floor((inicioMin ?? 0) / 60))
    .set('minute', (inicioMin ?? 0) % 60)
  const fim = dayjs()
    .set('hour', Math.floor((fimMin ?? 0) / 60))
    .set('minute', (fimMin ?? 0) % 60)
  const travelTime =
    inicioMin === null || fimMin === null ? 0 : fim.diff(inicio, 'minute')

  const hora = String(Math.floor(travelTime / 60)).padStart(2, '0')
  const resto = String(travelTime % 60).padStart(2, '0')
  const TEMPOVIAGEM = `${hora}:${resto}`

  const valorHora = VALHRATENDIMENTO ?? 0
  let VALATENDIMENTO = 0
  const valorMinuto = valorHora / 60

  let totalMinutos = TEMPOATENDIMENTO ?? 0
  if (TFCOBRARTEMPOVIAGEM === 'S') {
    totalMinutos += travelTime
  }

  if (TFCOBRARHRCHEIA === 'S') {
    const horasCheias = Math.ceil(totalMinutos / 60)
    VALATENDIMENTO = horasCheias * valorHora
  } else {
    VALATENDIMENTO = Number.parseFloat((valorMinuto * totalMinutos).toFixed(2))
  }

  const kmFinal = kmFinalParam ?? KMFINAL

  let VALKM = 0
  if (DESLOCAMENTO_APP === 1 && KMINICIAL > 0 && kmFinal > 0) {
    VALKM = Number.parseFloat(
      ((kmFinal - KMINICIAL) * (VALKMATENDIMENTO ?? 0)).toFixed(2)
    )
  }

  return {
    aplicado: true,
    TEMPOVIAGEM,
    VALATENDIMENTO,
    VALKM,
  }
}
