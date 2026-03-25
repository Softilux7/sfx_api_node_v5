import { randomUUID } from 'node:crypto'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { prisma } from '@/lib/prisma'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

const uploadSchema = z.object({
  idAtendimento: z.string(),
  idBase: z.string(),
  empresa_id: z.string(),
  type: z.enum(['1', '2']),
})

export const uploadPhotos: FastifyPluginAsyncZod = async app => {
  app.post(
    '/upload',
    {
      schema: {
        tags: ['photos'],
        summary: 'Upload de fotos ou assinatura',
        description:
          'Endpoint para upload de fotos do atendimento ou assinatura.',
      },
    },
    async (request, reply) => {
      const parts = request.parts()

      const fields: Record<string, string> = {}
      let fileBuffer: Buffer | null = null

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

      const parseResult = uploadSchema.safeParse(fields)
      if (!parseResult.success || !fileBuffer) {
        return reply
          .status(400)
          .send({
            success: false,
            message: 'Parâmetros obrigatórios ausentes ou inválidos.',
          })
      }

      const { idAtendimento, idBase, type } = parseResult.data
      const folder = type === '1' ? 'fotos' : 'assinatura'
      const filename = type === '1' ? `${randomUUID()}.jpg` : 'assinatura.jpg'

      const rootPath = '/var/www/html'
      const fullDirPath = path.join(
        rootPath,
        'files',
        idBase,
        idAtendimento,
        folder
      )
      const fullFilePath = path.join(fullDirPath, filename)

      fs.mkdirSync(fullDirPath, { recursive: true })
      fs.writeFileSync(fullFilePath, fileBuffer)

      await prisma.app_atendimento_photos.create({
        data: {
          ID_BASE: Number(idBase),
          id_empresa: Number(fields.empresa_id),
          id_atendimento: Number(idAtendimento),
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
        data: {
          path: `/files/${idBase}/${idAtendimento}/${folder}/${filename}`,
          filename,
        },
      })
    }
  )
}
