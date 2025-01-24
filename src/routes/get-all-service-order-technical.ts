import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function getAllServiceOrderTechnical(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/tecnico/:idTecnico/:idBase/:status/todos-chamados-tecnico', {
      schema: {
        params: z.object({
          idTecnico: z.string(),
          idBase: z.coerce.number(),
          status: z.string(),
        }),
      },
    },
      async (request) => {
        const { idTecnico, idBase, status } = request.params;

        // Consulta para buscar os chamados
        const chamados = await prisma.chamados.findMany({
          where: {
            NMSUPORTET: idTecnico,
            ID_BASE: idBase,
            TFLIBERADO: 'S',
            STATUS: status,
          },
          select: {
            id: true,
            CDEMPRESA: true,
            empresa_id: true,
            SEQOS: true,
            STATUS: true,
            CDSTATUS: true,
            SEQCONTRATO: true,
            CDEQUIPAMENTO: true,
            CDCLIENTE: true,
            NMCLIENTE: true,
            CONTATO: true,
            DTINCLUSAO: true,
            HRINCLUSAO: true,
            DTPREVENTREGA: true,
            HRPREVENTREGA: true,
            DTATENDIMENTO: true,
          },

          take: 20
        });

        // Verifica se chamados não contém resultados
        if (chamados.length === 0) {
          throw new BadRequest('Chamados não encontrados!');
        }

        // Extrai os códigos de equipamentos dos chamados
        const equipamentosIds = chamados
          .map((chamado) => chamado.CDEQUIPAMENTO)
          .filter((id): id is number => id !== null); // Filtra os valores nulos

        // Consulta para buscar os equipamentos relacionados
        const equipamentos = await prisma.equipamentos.findMany({
          where: {
            ID_BASE: idBase,
            CDEQUIPAMENTO: {
              in: equipamentosIds,
            },
          },
          select: {
            CDEQUIPAMENTO: true,
            ID_BASE: true,
            SERIE: true,
            MODELO: true,
            DEPARTAMENTO: true,
            LOCALINSTAL: true,
            PATRIMONIO: true,
          },

          take: 20
        });

        // Cria um map de equipamentos por CDEQUIPAMENTO
        const equipamentosMap = equipamentos.reduce((acc, equipamento) => {
          if (equipamento.CDEQUIPAMENTO) {
            acc[equipamento.CDEQUIPAMENTO] = equipamento;
          }
          return acc;
        }, {} as Record<string, typeof equipamentos[0]>);

        // Associa diretamente os dados dos equipamentos ao chamado
        const chamadosComEquipamentos = chamados.map((chamado) => ({
          ...chamado,
          equipamento: chamado.CDEQUIPAMENTO
            ? equipamentosMap[chamado.CDEQUIPAMENTO] || null
            : null,
        }));

        // Retorna todos os chamados com os dados dos equipamentos associados diretamente
        return { success: true, chamados: chamadosComEquipamentos };
      });
}