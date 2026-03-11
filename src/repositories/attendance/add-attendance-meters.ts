import { BadRequest } from '../../infra/http/routes/@errors/bad-request'
import { prisma } from '../../lib/prisma'

type Meter = {
  CDMEDIDOR: string
  MEDIDOR: number
}

type AddAtendimentoMetersInput = {
  id: number
  ID_BASE: number
  empresa_id: number
  cdequipamento: number
  informante: string
  meters_list: Meter[]
}

export async function addAtendimentoMetersService(
  input: AddAtendimentoMetersInput
) {
  const { id, ID_BASE, empresa_id, cdequipamento, informante, meters_list } =
    input

  const result = await prisma.atendimentos_medidores.createMany({
    data: meters_list.map(meter => ({
      ID_BASE,
      empresa_id,
      INFORMANTE: informante,
      CD_ATENDIMENTO_ORIGEM: id,
      DT_LEITURA: new Date(),
      CDEQUIPAMENTO: cdequipamento,
      CDMEDIDOR: meter.CDMEDIDOR,
      MEDIDOR: meter.MEDIDOR,
    })),
  })

  if (!result) {
    throw new BadRequest(
      'Atendimento não encontrado para inserção de medidores.'
    )
  }

  return result
}
