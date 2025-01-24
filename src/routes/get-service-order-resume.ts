import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { FastifyInstance } from 'fastify';
import { getCompaniesByTechnical } from '../repositories/get-companies-technical-repositorie';

export async function getResumoChamados(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/tecnicos/:tecnicoId/:idBase/resumo-chamados', {
      schema: {
        params: z.object({
          tecnicoId: z.string(),
          idBase: z.coerce.number(),
        }),
      },
    },
      async (request) => {
        const { tecnicoId, idBase } = request.params;

        // Obtém as empresas vinculadas ao técnico
        const empresas = await getCompaniesByTechnical(tecnicoId, idBase);

        if (empresas.length === 0) {
          return {
            success: false,
            message: 'Nenhuma empresa encontrada para o técnico fornecido.',
          };
        }

        // Realiza a query para obter o resumo de chamados
        const resumoChamados = await prisma.chamados.groupBy({
          by: ['STATUS'],
          _count: {
            STATUS: true,
          },
          where: {
            ID_BASE: idBase,
            empresa_id: { in: empresas }, // Filtra pelas empresas vinculadas
            TFLIBERADO: 'S',
            NMSUPORTET: tecnicoId,
          },
        });

        // Mapeia os STATUS para o formato solicitado
        const result = resumoChamados.reduce((acc, chamado) => {
          const statusKey = chamado.STATUS; // Aqui, você pode mapear os STATUS para suas letras correspondentes (C, E, etc.)
          if (statusKey !== null) {
            acc[statusKey] = chamado._count.STATUS;
            return acc;
          }
          return acc;
        }, {} as Record<string, number>);

        return {
          success: true,
          data: result, // Resultado já formatado
        };
      });
}
