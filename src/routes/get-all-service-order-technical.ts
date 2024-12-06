import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function getAllServiceOrderTechnical(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/tecnico/:idTecnico/:idBase/todos-chamados-tecnico', {
      schema: {
        params: z.object({
          idTecnico: z.string(),
          idBase: z.coerce.number(),
        }),
      },
    },
    async (request) => {
      const { idTecnico, idBase } = request.params;

      // Consulta Prisma para buscar os chamados
      const chamados = await prisma.chamados.findMany({
        where: {
          NMSUPORTET: idTecnico,
          ID_BASE: idBase,
          TFLIBERADO: 'S',
        },
        select: {
          empresa_id: true,
          SEQCONTRATO: true,
          CDEQUIPAMENTO: true,
          CDCLIENTE: true,
          NMCLIENTE: true,
        },
      });

      // Verifica se chamados não contém resultados
      if (chamados.length === 0) {
        throw new BadRequest('Chamados não encontrados!');
      }

      // Extrai os códigos de equipamentos dos chamados
      const equipamentosIds = chamados
        .map((chamado) => chamado.CDEQUIPAMENTO)
        .filter((id): id is number => id !== null); // Filtra os valores nulos

      // Consulta Prisma para buscar os equipamentos relacionados
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
      });

      // Agrupa os equipamentos pelos códigos de equipamento
      const equipamentosMap = equipamentos.reduce((acc, equipamento) => {
        const equipamentoId = equipamento.CDEQUIPAMENTO;
        if (equipamentoId) {
          if (!acc[equipamentoId]) {
            acc[equipamentoId] = [];
          }
          acc[equipamentoId].push(equipamento);
        }
        return acc;
      }, {} as Record<string, typeof equipamentos>);

      // Associa os equipamentos correspondentes a cada chamado
      const chamadosComEquipamentos = chamados.map((chamado) => ({
        ...chamado,
        equipamentos: chamado.CDEQUIPAMENTO ? equipamentosMap[chamado.CDEQUIPAMENTO] || [] : [],
      }));

      // Retorna todos os chamados com seus respectivos equipamentos
      return { success: true, chamados: chamadosComEquipamentos };
    });
}
