import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { addTimeLine } from '../../functions/add-timeline'
import { calcularAtendimentoCaso30 } from '../../functions/calc-attendance'
import { BadRequest } from '../../infra/http/routes/@errors/bad-request'
import { prisma } from '../../lib/prisma'

export type AttendancePart = {
  quantidade: number
  cdproduto: string
  nmproduto: string
}

export async function updateAttendance(
  id: number,
  ID_BASE: number,
  progress: number,
  params: {
    MOTIVO_PAUSA?: string | undefined
    ID_TRANSACTION?: number | undefined
    LATITUDE?: number | undefined
    LONGITUDE?: number | undefined
    KMINICIAL?: number | undefined
    VALESTACIONAMENTO?: number | undefined
    VALPEDAGIO?: number | undefined
    VALOUTRASDESP?: number | undefined
    CDMEDIDOR?: string | undefined
    MEDIDOR?: number | undefined
    HRATENDIMENTOFIN?: string | undefined
    HRATENDIMENTO?: string | undefined
    DTVIAGEMFIN?: Date | undefined
    DTVIAGEMINI?: Date | undefined
    HRVIAGEMINI?: string | undefined
    HRVIAGEMFIN?: string | undefined
    DESLOCAMENTO_APP?: number | undefined
    KMFINAL?: number | undefined
    FOLLOWUP?: string | undefined
    OBSERVACAO?: string | undefined
    SINTOMA?: string | undefined
    ACAO?: string | undefined
    CAUSA?: string | undefined
    NOME_CONTATO?: string | undefined
    CDSTATUS?: string | undefined
    STATUS?: string | undefined
    SEQOS?: number | undefined
    DESTINO_POS_ATENDIMENTO_APP?: number | undefined
    PARTS?: AttendancePart[] | undefined
  }
) {
  const create_at = dayjs().subtract(3, 'hour').toDate()
  // Lógica para diferentes etapas do progresso
  switch (progress) {
    case 2: {
      // Começar viagem
      await prisma.$executeRaw`
        UPDATE atendimentos
        SET ANDAMENTO_CHAMADO_APP = 2, HRVIAGEMINI = ${params.HRVIAGEMINI}
        WHERE id = ${id} AND ID_BASE = ${ID_BASE}`

      // Seleciona o atendimento atualizado
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const updatedAtendimento: any[] = await prisma.$queryRaw`
            SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}`

      if (updatedAtendimento.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [2]')
      }

      // Adicione registro à timeline
      await addTimeLine({
        id_atendimento: id,
        andamento_chamado_snapshot: '2',
        tipo_time_line: '1',
        address: '',
        latitute: params.LATITUDE,
        longitute: params.LONGITUDE,
        location_captured: 1,
        motivo: '',
        motivo_outros: '',
        id_tecnico: '',
        id_transaction: params.ID_TRANSACTION, //2
        ID_BASE: updatedAtendimento[0].ID_BASE,
        empresa_id: updatedAtendimento[0].empresa_id,
        create_at,
      })

      return updatedAtendimento[0]
    }

    case 3: {
      // PAUSA - ANTES de chegada no cliente
      await prisma.$executeRaw`
                UPDATE atendimentos
                SET ANDAMENTO_CHAMADO_APP = 3
                WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      // Seleciona o atendimento atualizado
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const pauseBeforeClient: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}`

      if (pauseBeforeClient.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [2]')
      }

      // Adicione registro à timeline
      await addTimeLine({
        id_atendimento: id,
        andamento_chamado_snapshot: '3',
        tipo_time_line: '1',
        address: '',
        latitute: params.LATITUDE,
        longitute: params.LONGITUDE,
        location_captured: 1,
        motivo: params.MOTIVO_PAUSA,
        motivo_outros: '',
        id_tecnico: '',
        id_transaction: params.ID_TRANSACTION, // 3
        ID_BASE: pauseBeforeClient[0].ID_BASE,
        empresa_id: pauseBeforeClient[0].empresa_id,
        create_at,
      })

      break
    }

    case 4: {
      // Chegada cliente
      await prisma.$executeRaw`
            UPDATE atendimentos
            SET 
                ANDAMENTO_CHAMADO_APP = 4,
                DTVIAGEMFIN = ${params.DTVIAGEMFIN},
                HRVIAGEMFIN = ${params.HRVIAGEMFIN},
                KMFINAL = ${params.KMFINAL}
            WHERE id = ${id} AND ID_BASE = ${ID_BASE}
        `

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const updatedArrivalTrip: any[] = await prisma.$queryRaw`
            SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
        `

      if (!updatedArrivalTrip || updatedArrivalTrip.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [4]')
      }

      // Adicione registro à timeline
      await addTimeLine({
        id_atendimento: id,
        andamento_chamado_snapshot: '4',
        tipo_time_line: '1',
        address: '',
        latitute: params.LATITUDE,
        longitute: params.LONGITUDE,
        location_captured: 1,
        motivo: '',
        motivo_outros: '',
        id_tecnico: '',
        id_transaction: params.ID_TRANSACTION, // 4
        ID_BASE: updatedArrivalTrip[0].ID_BASE,
        empresa_id: updatedArrivalTrip[0].empresa_id,
        create_at,
      })

      return updatedArrivalTrip[0]
    }

    case 5: {
      // PAUSA -  DEPOIS de chegar cliente
      await prisma.$executeRaw`
                UPDATE atendimentos
                SET ANDAMENTO_CHAMADO_APP = 5
                WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      // Seleciona o atendimento atualizado
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const pauseAfterClient: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}`

      if (pauseAfterClient.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [2]')
      }

      // Adicione registro à timeline
      await addTimeLine({
        id_atendimento: id,
        andamento_chamado_snapshot: '5',
        tipo_time_line: '1',
        address: '',
        latitute: params.LATITUDE,
        longitute: params.LONGITUDE,
        location_captured: 1,
        motivo: params.MOTIVO_PAUSA,
        motivo_outros: '',
        id_tecnico: '',
        id_transaction: params.ID_TRANSACTION, // 5
        ID_BASE: pauseAfterClient[0].ID_BASE,
        empresa_id: pauseAfterClient[0].empresa_id,
        create_at,
      })

      break
    }

    case 6: {
      // Em Atendimento
      await prisma.$executeRaw`
                UPDATE atendimentos
                SET ANDAMENTO_CHAMADO_APP = 6,
                    HRATENDIMENTO = ${params.HRATENDIMENTO}
                WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const updatedInAttendance: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      if (updatedInAttendance.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [6]')
      }

      // Adicione registro à timeline
      await addTimeLine({
        id_atendimento: id,
        andamento_chamado_snapshot: '6',
        tipo_time_line: '1',
        address: '',
        latitute: params.LATITUDE,
        longitute: params.LONGITUDE,
        location_captured: 1,
        motivo: params.MOTIVO_PAUSA,
        motivo_outros: '',
        id_tecnico: '',
        id_transaction: params.ID_TRANSACTION, // 6
        ID_BASE: updatedInAttendance[0].ID_BASE,
        empresa_id: updatedInAttendance[0].empresa_id,
        create_at,
      })

      return updatedInAttendance[0]
    }

    case 7: {
      // PAUSA - Durante atendimento
      await prisma.$queryRaw`
                UPDATE atendimentos
                SET ANDAMENTO_CHAMADO_APP = 7
                WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const pauseInAttendace: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      if (pauseInAttendace.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [7]')
      }

      // Adicione registro à timeline
      await addTimeLine({
        id_atendimento: id,
        andamento_chamado_snapshot: '7',
        tipo_time_line: '1',
        address: '',
        latitute: params.LATITUDE,
        longitute: params.LONGITUDE,
        location_captured: 1,
        motivo: params.MOTIVO_PAUSA,
        motivo_outros: '',
        id_tecnico: '',
        id_transaction: params.ID_TRANSACTION, // 7
        ID_BASE: pauseInAttendace[0].ID_BASE,
        empresa_id: pauseInAttendace[0].empresa_id,
        create_at,
      })

      return pauseInAttendace
    }

    case 8: {
      // Atendimento finalizado
      await prisma.$executeRaw`
                UPDATE atendimentos
                SET ANDAMENTO_CHAMADO_APP = 8
                WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const updatedFinishAttendance: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      if (updatedFinishAttendance.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [8]')
      }

      await addTimeLine({
        id_atendimento: id,
        andamento_chamado_snapshot: '8',
        tipo_time_line: '1',
        address: '',
        latitute: params.LATITUDE,
        longitute: params.LONGITUDE,
        location_captured: 1,
        motivo: '',
        motivo_outros: '',
        id_tecnico: '',
        id_transaction: params.ID_TRANSACTION, // 8
        ID_BASE: updatedFinishAttendance[0].ID_BASE,
        empresa_id: updatedFinishAttendance[0].empresa_id,
        create_at,
      })

      return updatedFinishAttendance[0]
    }

    case 9: {
      // Marcar peças como trocadas
      if (params.PARTS && params.PARTS.length > 0) {
        const productCodes = params.PARTS.map(p => p.cdproduto)
        await prisma.$executeRaw`
          UPDATE chamados_itens
          SET TF_TROCA_KIT_TECNICO = 'S'
          WHERE SEQOS = ${params.SEQOS}
            AND ID_BASE = ${ID_BASE}
            AND CDPRODUTO IN (${Prisma.join(productCodes)})
        `
      }

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const updateAtendimentoChangePart: any[] = await prisma.$queryRaw`
            SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}`

      if (updateAtendimentoChangePart.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [9]')
      }

      return updateAtendimentoChangePart[0]
    }

    case 10: {
      // Formulário finalizado
      await prisma.$executeRaw`
            UPDATE atendimentos
            SET 
                OBSERVACAO = ${params.OBSERVACAO},
                SINTOMA = ${params.SINTOMA},
                CAUSA = ${params.CAUSA},
                ACAO = ${params.ACAO},
                VALESTACIONAMENTO = ${params.VALESTACIONAMENTO},
                VALPEDAGIO = ${params.VALPEDAGIO},
                VALOUTRASDESP = ${params.VALOUTRASDESP},
                NOME_CONTATO = ${params.NOME_CONTATO},
                CDMEDIDOR = ${params.CDMEDIDOR},
                MEDIDOR = ${params.MEDIDOR},
                ANDAMENTO_CHAMADO_APP = 10
            WHERE id = ${id} AND ID_BASE = ${ID_BASE}
        `

      // Atualiza o status do chamado e observação defeito (follow-up)
      await prisma.$executeRaw`
            UPDATE chamados 
            SET 
                OBSDEFEITOATS = ${params.FOLLOWUP},
                STATUS = ${params.STATUS},
                CDSTATUS = ${params.CDSTATUS}
            WHERE ID_BASE = ${ID_BASE} AND SEQOS = ${params.SEQOS}
        `

      // Buscar os dados atualizados
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const updatedFormAttendance: any[] = await prisma.$queryRaw`
            SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
        `

      if (updatedFormAttendance.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [10]')
      }

      await addTimeLine({
        id_atendimento: id,
        andamento_chamado_snapshot: '10',
        tipo_time_line: '1',
        address: '',
        latitute: params.LATITUDE,
        longitute: params.LONGITUDE,
        location_captured: 1,
        motivo: '',
        motivo_outros: '',
        id_tecnico: '',
        id_transaction: params.ID_TRANSACTION, // 9
        ID_BASE: updatedFormAttendance[0].ID_BASE,
        empresa_id: updatedFormAttendance[0].empresa_id,
        create_at,
      })

      return updatedFormAttendance[0]
    }

    // Assinatura concluída
    case 11: {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const response: any[] = await prisma.$queryRaw`
            SELECT HRATENDIMENTO FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      if (response.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [10]')
      }

      // Formata os horários recebidos no padrão HH:mm:ss
      const HRATENDIMENTOINI = dayjs
        .utc(response[0].HRATENDIMENTO)
        .format('HH:mm:ss')

      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const HRATENDIMENTOFIN = params.HRATENDIMENTOFIN!

      const getTimeService = (start: string, end: string): number => {
        const startTime = dayjs(`1970-01-01T${start}`)
        const endTime = dayjs(`1970-01-01T${end}`)

        const diffInMinutes = endTime.diff(startTime, 'minute')
        return diffInMinutes
      }

      const TEMPOATENDIMENTO = getTimeService(
        HRATENDIMENTOINI,
        HRATENDIMENTOFIN
      )

      // Atualiza a tabela atendimentos
      await prisma.$executeRaw`
                UPDATE atendimentos
                SET 
                    HRATENDIMENTOFIN = ${params.HRATENDIMENTOFIN},
                    TEMPOATENDIMENTO = ${TEMPOATENDIMENTO},
                    ANDAMENTO_CHAMADO_APP = 11
                WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      // Buscar os dados atualizados
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const updatedAttendance: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      if (!updatedAttendance || updatedAttendance.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [11]')
      }

      await addTimeLine({
        id_atendimento: id,
        andamento_chamado_snapshot: '11',
        tipo_time_line: '1',
        address: '',
        latitute: params.LATITUDE,
        longitute: params.LONGITUDE,
        location_captured: 1,
        motivo: '',
        motivo_outros: '',
        id_tecnico: '',
        id_transaction: params.ID_TRANSACTION, // 10
        ID_BASE: updatedAttendance[0].ID_BASE,
        empresa_id: updatedAttendance[0].empresa_id,
        create_at,
      })

      return updatedAttendance[0]
    }

    case 15: {
      // Atendimento Cancelado
      await prisma.$executeRaw`
            UPDATE atendimentos
            SET 
                ANDAMENTO_CHAMADO_APP = 15,
                DTVIAGEMFIN = ${params.DTVIAGEMFIN},
                HRVIAGEMFIN = ${params.HRVIAGEMFIN},
                ATUALIZADO = 1, 
                TFVISITA = 'N'
            WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const cancelAttendance: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
            `

      // Atualiza os dados do chamado
      await prisma.$executeRaw`
            UPDATE chamados
            SET 
                STATUS = ${params.STATUS},
                CDSTATUS = ${params.CDSTATUS},
                ATUALIZADO = 2
            WHERE SEQOS = ${cancelAttendance[0].SEQOS} AND ID_BASE = ${cancelAttendance[0].ID_BASE}
            `

      if (!cancelAttendance || cancelAttendance.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [15]')
      }

      return cancelAttendance[0]
    }

    case 30:
      try {
        // Chamar a função e aguardar os cálculos
        const { TEMPOVIAGEM, VALATENDIMENTO, VALKM } =
          await calcularAtendimentoCaso30(id, ID_BASE, params.KMFINAL)

        const camposUpdate = [
          `TEMPOVIAGEM = '${TEMPOVIAGEM}'`, // <<-- coloque entre aspas
          `VALATENDIMENTO = ${VALATENDIMENTO}`,
          `VALKM = ${VALKM}`,
          // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
          `ANDAMENTO_CHAMADO_APP = 30`,
          // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
          `ATUALIZADO = 1`,
          `TFVISITA = 'S'`, // já está ok aqui
        ]

        if (params.KMFINAL !== undefined && params.KMFINAL !== null) {
          camposUpdate.push(`KMFINAL = ${params.KMFINAL}`)
        }

        const updateQuery = `
        UPDATE atendimentos 
        SET ${camposUpdate.join(', ')}
        WHERE ID_BASE = ${ID_BASE} AND id = ${id};
      `

        await prisma.$executeRawUnsafe(updateQuery)
        // Buscar os dados atualizados
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const updatedAttendance: any[] = await prisma.$queryRaw`
                SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
                `

        if (!updatedAttendance || updatedAttendance.length === 0) {
          throw new BadRequest('Não foi possível atualizar o progresso [11]')
        }

        // Atualiza o status do chamado
        await prisma.$executeRaw`
            UPDATE chamados 
            SET 
                ATUALIZADO = 2
            WHERE ID_BASE = ${updatedAttendance[0].ID_BASE} AND SEQOS = ${updatedAttendance[0].SEQOS}
        `

        await addTimeLine({
          id_atendimento: id,
          andamento_chamado_snapshot: '30',
          tipo_time_line: '1',
          address: '',
          latitute: params.LATITUDE,
          longitute: params.LONGITUDE,
          location_captured: 1,
          motivo: '',
          motivo_outros: '',
          id_tecnico: '',
          id_transaction: params.ID_TRANSACTION, // 11
          ID_BASE: updatedAttendance[0].ID_BASE,
          empresa_id: updatedAttendance[0].empresa_id,
          create_at,
        })

        return updatedAttendance[0]
      } catch (error) {
        console.error('Erro ao calcular atendimento caso 30:', error)
      }
      break

    case 23: {
      // Retorno pós atendimento
      await prisma.$executeRaw`
            UPDATE atendimentos
            SET 
                DESTINO_POS_ATENDIMENTO_APP = ${params.DESTINO_POS_ATENDIMENTO_APP},
                ANDAMENTO_CHAMADO_APP = 23
            WHERE id = ${id} AND ID_BASE = ${ID_BASE}
        `

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const returnBack: any[] = await prisma.$queryRaw`
            SELECT * FROM atendimentos WHERE id = ${id} AND ID_BASE = ${ID_BASE}
        `

      if (!returnBack || returnBack.length === 0) {
        throw new BadRequest('Não foi possível atualizar o progresso [31]')
      }

      await addTimeLine({
        id_atendimento: id,
        andamento_chamado_snapshot: '23',
        tipo_time_line: '1',
        address: '',
        latitute: params.LATITUDE,
        longitute: params.LONGITUDE,
        location_captured: 1,
        motivo: '',
        motivo_outros: '',
        id_tecnico: '',
        id_transaction: params.ID_TRANSACTION, // 11 OU 12
        ID_BASE: returnBack[0].ID_BASE,
        empresa_id: returnBack[0].empresa_id,
        create_at,
      })

      return returnBack[0]
    }

    default:
      throw new BadRequest('Progresso inválido.')
  }
}
