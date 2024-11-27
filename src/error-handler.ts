import { FastifyInstance } from "fastify";
import { BadRequest } from "./routes/_errors/bad-request";
import { ZodError } from "zod";

type FastifyErrorHandler = FastifyInstance['errorHandler']

// Manipulador de erros fastify
export const errorHandler: FastifyErrorHandler = (error, _, reply) => {

    if(error instanceof ZodError) {
        return reply.status(400).send({
            message: `Error validando requisição`,
            errors: error.flatten().fieldErrors
        })
    }

    if (error instanceof BadRequest) {
        return reply.status(400).send({ message: error.message })
    }

    return reply.status(500).send({message: "Internal server error"})
}