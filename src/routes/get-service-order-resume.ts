import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { getResumoChamadosRepository } from '../repositories/get-service-order-resume';

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

            const data = await getResumoChamadosRepository(tecnicoId, idBase);

            return { success: true, data }
        });
}