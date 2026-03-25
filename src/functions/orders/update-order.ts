import { AppError } from '@/infra/http/error'
import { prisma } from '@/lib/prisma'

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
  const chamado = await prisma.chamados.findUnique({
    where: {
      id: chamado_id,
      ID_BASE,
      empresa_id,
    },
  })

  if (!chamado) {
    throw new AppError('Chamado não encontrado para atualizar!', 404)
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const updatedData: any = {
    ativo_app,
  }

  if (followUp && followUp.trim() !== '') {
    const followUpSanitized = followUp.replace(/\n/g, '')
    updatedData.OBSDEFEITOATS = followUpSanitized
  }

  const atualizadoAppTimestamp = chamado.ATUALIZADO_APP
    ? new Date(chamado.ATUALIZADO_APP).getTime()
    : null
  const dateTimeTransactionTimestamp = dateTimeTransaction
    ? new Date(dateTimeTransaction).getTime()
    : null

  if (
    !dateTimeTransaction ||
    dateTimeTransaction === '2000-01-01 00:00:00' ||
    !atualizadoAppTimestamp ||
    (dateTimeTransactionTimestamp &&
      dateTimeTransactionTimestamp > atualizadoAppTimestamp)
  ) {
    if (STATUS !== null) {
      updatedData.STATUS = STATUS
    }

    if (CDSTATUS !== null) {
      updatedData.CDSTATUS = CDSTATUS
    }

    const newDatetime = dateTimeTransactionTimestamp
      ? new Date(dateTimeTransactionTimestamp).toISOString()
      : new Date().toISOString()
    updatedData.ATUALIZADO_APP = newDatetime
  }

  if (progress === 30 || progress === 0) {
    updatedData.ATUALIZADO = chamado.SEQOS > 0 ? '2' : '1'
  }

  const updatedChamado = await prisma.chamados.update({
    where: {
      id: chamado_id,
      ID_BASE,
      empresa_id,
    },
    data: updatedData,
  })

  return updatedChamado
}
