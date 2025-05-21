import { FastifyInstance } from "fastify";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import { z } from "zod";

const uploadSchema = z.object({
  idAtendimento: z.string(),
  idBase: z.string(),
  type: z.enum(["1", "2"]),
});

export async function uploadPhotos(app: FastifyInstance) {

  app.post("/upload", async (request, reply) => {
    const parts = request.parts();

    const fields: Record<string, string> = {};
    let fileBuffer: Buffer | null = null;
    let originalFilename = "";

    for await (const part of parts) {
      if (part.type === "file") {
        const chunks = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        fileBuffer = Buffer.concat(chunks);
      } else {
        fields[part.fieldname] = part.value as string;
      }
    }

    // Valida os campos obrigatórios
    const parseResult = uploadSchema.safeParse(fields);
    if (!parseResult.success || !fileBuffer) {
      return reply.status(400).send({ error: "Parâmetros obrigatórios ausentes ou inválidos." });
    }

    const { idAtendimento, idBase, type } = parseResult.data;
    const folder = type === "1" ? "fotos" : "assinatura";
    const filename = type === "1" ? `${randomUUID()}.jpg` : "assinatura.jpg";

    //TODO: LEMBRAR DE ALTERAR O ROOTPATH
    const rootPath = path.join(__dirname, "..", "uploads");
    const fullDirPath = path.join(rootPath, "files", idBase, idAtendimento, folder);
    const fullFilePath = path.join(fullDirPath, filename);

    try {
      fs.mkdirSync(fullDirPath, { recursive: true });
      fs.writeFileSync(fullFilePath, fileBuffer);

      return reply.send({
        success: true,
        path: `/files/${idBase}/${idAtendimento}/${folder}/${filename}`,
        filename, 
      });
    } catch (err) {
      console.error("Erro ao salvar o arquivo:", err);
      return reply.status(500).send({ error: "Erro ao salvar o arquivo." });
    }
  });
}
