import { AppError } from '@/infra/http/error'
import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import { updateOrder } from '../orders/update-order'
import { addTimeLine } from './add-timeline'

type CreateAtendimentoInput = {
  SEQOS: number
  CDSTATUS: string
  STATUS: string
  NMATENDENTE: string
  OBSERVACAO: string
  chamado_id: number
  empresa_id: number
  ID_BASE: number
  ATIVO_APP: number
  KMINICIAL: number
  PLACAVEICULO: string
  ANDAMENTO_CHAMADO_APP: number
  ORIGEM_CADASTRO?: string
  granted_geolocation?: number
  DESLOCAMENTO_APP?: number
  LATITUDE?: number | null
  LONGITUDE?: number | null
}

export async function createAttendaceFn(input: CreateAtendimentoInput) {
  const {
    SEQOS,
    NMATENDENTE,
    CDSTATUS,
    STATUS,
    OBSERVACAO,
    chamado_id,
    empresa_id,
    ID_BASE,
    ATIVO_APP,
    KMINICIAL,
    PLACAVEICULO,
    ANDAMENTO_CHAMADO_APP,
    granted_geolocation,
    DESLOCAMENTO_APP = 0,
    LATITUDE,
    LONGITUDE,
  } = input

  const now = dayjs()
  const create_at = dayjs().subtract(3, 'hour').toDate()
  const DTATENDIMENTO = now.startOf('day').toDate()

  const atendimento = await prisma.atendimentos.create({
    data: {
      TFVISITA: 'N',
      SEQOS,
      NMATENDENTE,
      OBSERVACAO,
      ATUALIZADO: '0',
      chamado_id,
      empresa_id,
      ID_BASE,
      ATIVO_APP,
      KMINICIAL,
      PLACAVEICULO,
      ANDAMENTO_CHAMADO_APP,
      DTATENDIMENTO,
      ORIGEM_CADASTRO: 'APP',
      granted_geolocation,
      DESLOCAMENTO_APP,
      DTMEDIDORDESC: null,
      DTVIAGEMINI: new Date(),
      DTVIAGEMFIN: null,
    },
  })

  const chamadoUpdated = await updateOrder(
    ID_BASE,
    chamado_id,
    empresa_id,
    STATUS,
    CDSTATUS,
    ATIVO_APP,
    '',
    '2000-01-01 00:00:00',
    0
  )

  if (!chamadoUpdated) {
    throw new AppError('Não foi possível atualizar o chamado!', 400)
  }

  await addTimeLine({
    id_atendimento: atendimento.id,
    andamento_chamado_snapshot: '1',
    tipo_time_line: '1',
    address: '',
    latitute: LATITUDE || 0,
    longitute: LONGITUDE || 0,
    location_captured: 1,
    motivo: '',
    motivo_outros: '',
    id_tecnico: '',
    id_transaction: 1,
    ID_BASE,
    empresa_id,
    create_at,
  })

  return atendimento
}
