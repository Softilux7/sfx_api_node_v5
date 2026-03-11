import { randomUUID } from 'node:crypto'
import * as fs from 'node:fs'
import * as path from 'node:path'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

const uploadSchema = z.object({
  idAtendimento: z.string(),
  idBase: z.string(),
  empresa_id: z.string(),
  type: z.enum(['1', '2']),
})

// Rota de upload de imagens (fotos, assinatura)
export async function uploadPhotos(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    const parts = request.parts()

    const fields: Record<string, string> = {}
    let fileBuffer: Buffer | null = null
    const originalFilename = ''

    for await (const part of parts) {
      if (part.type === 'file') {
        const chunks = []
        for await (const chunk of part.file) {
          chunks.push(chunk)
        }
        fileBuffer = Buffer.concat(chunks)
      } else {
        fields[part.fieldname] = part.value as string
      }
    }

    // Valida os campos obrigatórios
    const parseResult = uploadSchema.safeParse(fields)
    if (!parseResult.success || !fileBuffer) {
      return reply
        .status(400)
        .send({ error: 'Parâmetros obrigatórios ausentes ou inválidos.' })
    }

    const { idAtendimento, idBase, type } = parseResult.data
    const folder = type === '1' ? 'fotos' : 'assinatura'
    const filename = type === '1' ? `${randomUUID()}.jpg` : 'assinatura.jpg'

    // const rootPath = path.join(__dirname, '..', 'uploads')
    const rootPath = '/var/www/html'
    const fullDirPath = path.join(
      rootPath,
      'files',
      idBase,
      idAtendimento,
      folder
    )
    const fullFilePath = path.join(fullDirPath, filename)

    try {
      fs.mkdirSync(fullDirPath, { recursive: true })
      fs.writeFileSync(fullFilePath, fileBuffer)

      // Cria registro na tabela app_atendimento_photos
      await prisma.app_atendimento_photos.create({
        data: {
          ID_BASE: Number(idBase),
          id_empresa: Number(fields.empresa_id),
          id_atendimento: Number(idAtendimento), // pode usar string se o campo no banco for VARCHAR
          type: Number(type),
          status: 1,
          create_at: new Date(),
          filename,
          path: `/${idBase}/${idAtendimento}/${folder}/`,
          description: null,
        },
      })

      return reply.send({
        success: true,
        path: `/files/${idBase}/${idAtendimento}/${folder}/${filename}`,
        filename,
      })
    } catch (err) {
      console.error('Erro ao salvar o arquivo:', err)
      return reply.status(500).send({ error: 'Erro ao salvar o arquivo.' })
    }
  })
}
