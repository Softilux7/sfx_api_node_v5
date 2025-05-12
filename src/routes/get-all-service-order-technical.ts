import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { getAllOrdersRepository } from "../repositories/orders/get-all-order.repository";

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

        const data = await getAllOrdersRepository(idTecnico, idBase, status)

        return { success: true, chamados: data };
      });
}
