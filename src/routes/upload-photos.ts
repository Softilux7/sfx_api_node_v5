import type { FastifyInstance } from "fastify";
import * as fs from "fs";
import * as path from "path";
import fastifyMultipart from "@fastify/multipart";

export async function uploadPhotos(app: FastifyInstance) {
  app.register(fastifyMultipart);

  app.post('/upload', async (request, reply) => {
    const data = await request.file(); // Obtém um único arquivo enviado
    if (!data) {
      return reply.status(400).send({ error: "Nenhum arquivo enviado." });
    }

    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, data.filename);
    const writeStream = fs.createWriteStream(filePath);
    
    await data.file.pipe(writeStream);

    return reply.send({ success: true, file: `/uploads/${data.filename}` });
  });
}
