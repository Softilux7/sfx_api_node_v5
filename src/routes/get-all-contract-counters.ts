import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { getAllContractCounters } from '../services/get-all-contract-counters-service';

export async function getAlltCounters(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/tecnicos/:idBase/:empresaId/:seqContrato/:cdEquipamento/todos-medidores-contrato', {
      schema: {
        params: z.object({
          idBase: z.coerce.number(),
          empresaId: z.coerce.number(),
          seqContrato: z.coerce.number(),
          cdEquipamento: z.coerce.number(),
        }),
      },
    },
    async (request) => {
      const { idBase, empresaId, seqContrato, cdEquipamento } = request.params;

      // Usa a função de serviço para obter os medidores
      const contractCounters = await getAllContractCounters(idBase, empresaId, seqContrato, cdEquipamento);

      return { success: true, data: { medidores: contractCounters } };
    });
}