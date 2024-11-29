import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { getCompaniesByTechnical } from '../services/get-companies-technical-service';

export async function getCompanyTechnical(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/tecnicos/:tecnicoId/:idBase/empresas', {
      schema: {
        params: z.object({
          tecnicoId: z.string(),
          idBase: z.coerce.number(),
        }),
      },
    },
    async (request) => {
      const { tecnicoId, idBase } = request.params;

      // Usa a função utilitária para obter as empresas
      const empresas = await getCompaniesByTechnical(tecnicoId, idBase);

      return { success: true, data: { empresas: empresas.join(',') } };
    });
}
