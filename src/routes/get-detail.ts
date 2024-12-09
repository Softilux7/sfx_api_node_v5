import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from './_errors/bad-request';
import { getAllContractCounters } from '../repositories/get-all-contract-counters-repositorie';
import { getTypeCounters } from '../repositories/get-type-counters-repositorie';
import { getLinkedParts } from '../repositories/get-linked-parts-repositorie';

export async function getDetail(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/chamados/:id/detail', {
      schema: {
        params: z.object({
          id: z.coerce.number(),
        }),
      },
    },
    async (request) => {
      const { id } = request.params;

      const details = await prisma.chamados.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          SEQOS: true,
          empresa_id: true,
          CDEMPRESA: true,
          DTINCLUSAO: true,
          HRINCLUSAO: true,
          NMCLIENTE: true,
          DTPREVENTREGA: true,
          HRPREVENTREGA: true,
          ID_BASE: true,
          NMSUPORTEA: true,
          ENDERECO: true,
          NUM: true,
          COMPLEMENTO: true,
          BAIRRO: true,
          CIDADE: true,
          UF: true,
          CEP: true,
          CONTATO: true,
          DDD: true,
          FONE: true,
          EMAIL: true,
          OBSDEFEITOATS: true,
          OBSDEFEITOCLI: true,
          DEPARTAMENTO: true,
          STATUS: true,
          CDSTATUS: true,
          CDDEFEITO: true,
          CDEQUIPAMENTO: true,
          SEQCONTRATO: true,
          empresas: {
            select: {
              empresa_fantasia: true,
            },
          },
          equipamentos: {
            select: {
              SERIE: true,
              MODELO: true,
              DEPARTAMENTO: true,
              LOCALINSTAL: true,
              PATRIMONIO: true,
            },
          },
        },        
      });

      if (!details) {
        throw new BadRequest('Detalhes não encontrados!');
      }

      const prevAtendimento = `${details.DTPREVENTREGA} ${details.HRPREVENTREGA}`;

      const phone = `${details.DDD} ${details.FONE}`;

      // Busca os detalhes do defeito associado ao chamado, caso exista.
      const defect = await prisma.defeitos.findFirst({
        where: {
          CDDEFEITO: details.CDDEFEITO,
        },
        select: {
          NMDEFEITO: true,
        }
      });

      // Valida se os campos necessários para a busca de medidores estão presentes.
      if (details.ID_BASE === null || details.empresa_id === null || details.CDEQUIPAMENTO === null) {
        throw new BadRequest('Campos necessários não encontrados!');
      }

      // Busca os medidores associados ao contrato através do serviço `getAllContractCounters`.
      let counters = await getAllContractCounters(details.ID_BASE, details.empresa_id, details.SEQCONTRATO, details.CDEQUIPAMENTO);

      // Verifica se a consulta retornou resultados
      if (!counters || counters.length === 0) {
        // Se não houver resultados, continua consultando pelo modo antigo
        counters = await getTypeCounters(details.ID_BASE, details.CDEQUIPAMENTO);
      }

      // Verifica se o resultado da consulta de medidores contém dados
      if (counters && counters.length > 0) {
        const linkedParts = await getLinkedParts(details.ID_BASE, details.SEQOS);

        // Retorno final com todos os dados requisitados
        return { success: true, details, prevAtendimento, phone, defect, counters, linkedParts };
      } else {
        // Se não houver dados de medidores, responde com sucesso falso
        return { success: false, data: [] };
      }
    })
}