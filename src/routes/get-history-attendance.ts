import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getAttendanceHistory } from '../repositories/get-history-attendance-repositorie';
import { BadRequest } from './_errors/bad-request';

export async function getHistoryAttendance(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/history/attendance/:ID_BASE/:idChamado', {
        schema: {
            params: z.object({
                ID_BASE: z.coerce.number(),
                idChamado: z.coerce.number(),
            }),
        },
    }, async (request, reply) => {
        const { ID_BASE, idChamado } = request.params;

        const attendanceHistory = await getAttendanceHistory(ID_BASE, idChamado);

        return reply.send({ success: true, data: attendanceHistory });
    });
}