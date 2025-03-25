import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getOrdersHistory } from '../repositories/get-history-order-repositorie';
import { BadRequest } from './_errors/bad-request';


export async function getHistoryOrders(app: FastifyInstance) {
    app
    .withTypeProvider<ZodTypeProvider>()
    .get('/history/orders/:idBase/:cdequipamento', {
        schema: {
            params: z.object({
                idBase: z.coerce.number(),
                cdequipamento: z.coerce.number(),
            }),
        },
    }, async (request) => {
        const { idBase, cdequipamento } = request.params;

        const ordersHistory = await getOrdersHistory(idBase, cdequipamento);

        return { success: true, data: ordersHistory };
    });
}