import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { registerVehicleRepositorie } from '../repositories/vehicles/register-vehicle-repositorie';

// Criar um veículo na base de dados
export async function registerVehicle(app: FastifyInstance) {
    app
    .withTypeProvider<ZodTypeProvider>()
    .post('/register-vehicle', {
        schema: {
            body: z.object({
                idBase: z.coerce.number(),
                tecnicoId: z.string(),
                placa: z.string(),
                nomeVeiculo: z.string(),
                km: z.coerce.number(),
            }),
        },
    }, async (request) => {
        
        const { idBase, tecnicoId, placa, nomeVeiculo, km } = request.body;

        // Chama o repositório
        const result = await registerVehicleRepositorie(idBase, tecnicoId, nomeVeiculo, placa, km);

        return result;
    });
}
