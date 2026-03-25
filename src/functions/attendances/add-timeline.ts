import { prisma } from '@/lib/prisma'

export type TimeLineEntry = {
  id_transaction?: number
  ID_BASE: number
  empresa_id: number
  id_atendimento: number
  id_tecnico: string
  create_at: Date
  andamento_chamado_snapshot: string
  tipo_time_line: string
  address: string
  latitute?: number
  longitute?: number
  distance?: number
  location_captured: number
  motivo?: string | null
  motivo_outros?: string | null
}

export async function addTimeLine(data: TimeLineEntry) {
  await prisma.$executeRaw`
    INSERT INTO app_atendimento_timeline (
      andamento_chamado_snapshot,
      tipo_time_line,
      address,
      latitute,
      longitute,
      location_captured,
      motivo,
      motivo_outros,
      id_atendimento,
      id_tecnico,
      ID_BASE,
      empresa_id,
      create_at,
      id_transaction,
      distance
    ) VALUES (
      ${data.andamento_chamado_snapshot},
      ${data.tipo_time_line},
      ${data.address},
      ${data.latitute},
      ${data.longitute},
      ${data.location_captured},
      ${data.motivo},
      ${data.motivo_outros},
      ${data.id_atendimento},
      ${data.id_tecnico},
      ${data.ID_BASE},
      ${data.empresa_id},
      ${data.create_at},
      ${data.id_transaction ?? 0},
      ${data.distance ?? -1}
    )
  `
}
