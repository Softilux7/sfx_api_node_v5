import { prisma } from '../lib/prisma'

export type TimeLineEntry = {
  id_transaction?: number // int(5), opcional, default = 0
  ID_BASE: number // int(5)
  empresa_id: number // int(11)
  id_atendimento: number // int(11)
  id_tecnico: string // varchar(20)
  create_at: Date // timestamp
  andamento_chamado_snapshot: string // varchar(255)
  tipo_time_line: string // varchar(255)
  address: string // varchar(255)
  latitute?: number // float(12,8)
  longitute?: number // float(12,8)
  distance?: number // int(11), opcional, default = -1
  location_captured: number // tinyint(1) (0/1)
  motivo?: string | null // varchar(255), pode ser null
  motivo_outros?: string | null // text, pode ser null
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
