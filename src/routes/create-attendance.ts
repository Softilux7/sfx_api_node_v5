import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import dayjs from 'dayjs';
import { BadRequest } from './_errors/bad-request';
import { updateOrder } from '../repositories/orders/update-order-repositorie';

export async function createAtendimento(app: FastifyInstance) {

  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/atendimentos/add',
      {
        schema: {
          body: z.object({
            SEQOS: z.number(),
            CDSTATUS: z.string(),
            STATUS: z.string(),
            NMATENDENTE: z.string().max(10),
            OBSERVACAO: z.string().max(600),
            chamado_id: z.number(),
            empresa_id: z.coerce.number(),
            ID_BASE: z.coerce.number(),
            ATIVO_APP: z.number(),
            KMINICIAL: z.coerce.number(),
            PLACAVEICULO: z.string().max(15),
            ANDAMENTO_CHAMADO_APP: z.number(),
            ORIGEM_CADASTRO: z.string().optional(),
            granted_geolocation: z.number().optional(),
            DESLOCAMENTO_APP: z.number().optional(),
          }),
        },
      },
      async (request, reply) => {
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
        } = request.body;

        try {
          const now = dayjs(); // Data e hora atual no fuso horário configurado (pt-br)

          // `DTATENDIMENTO` deve ser um objeto `Date` com apenas a data
          const DTATENDIMENTO = now.startOf('day').toDate(); // Zera horas, minutos, segundos

          // Inserir o atendimento no banco de dados
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
          });

          const chamadoUpdated = await updateOrder(ID_BASE, chamado_id, empresa_id, STATUS, CDSTATUS, ATIVO_APP, "", "2000-01-01 00:00:00", 0)

          if (!chamadoUpdated) {
            throw new BadRequest("Não foi possível atualizar o chamado!")
          }
          return reply.send({
            success: true,
            message: 'Atendimento criado com sucesso!',
            atendimento,
          });
        } catch (error: any) {
          console.error('Erro ao criar atendimento:', error.message);
          return reply.status(500).send({ success: false, message: error.message });
        }
      }
    );
}
