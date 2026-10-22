import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import * as path from 'node:path'
import { withIdempotency } from '@/infra/http/idempotency'
import { prisma } from '@/lib/prisma'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

// idBase e idAtendimento viram pasta em disco: só inteiros positivos. Antes qualquer texto
// passava ("../", "undefined") e o arquivo ia parar fora da pasta do atendimento.
const positiveIntString = z
  .string()
  .regex(/^\d{1,10}$/)
  .refine(value => Number(value) > 0)

const uploadSchema = z.object({
  idAtendimento: positiveIntString,
  idBase: positiveIntString,
  empresa_id: z.string().optional(),
  type: z.enum(['1', '2']),
})

const ROOT_PATH = '/var/www/html'

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
        request.log.warn(
          { fields, hasFile: Boolean(fileBuffer) },
          'upload recusado: parâmetros ausentes ou inválidos'
        )
        return reply.status(400).send({
          success: false,
          message: 'Parâmetros obrigatórios ausentes ou inválidos.',
        })
      }

      const { idAtendimento, idBase, type, empresa_id } = parseResult.data
      const file = fileBuffer

      // empresa_id não vira caminho: valor inválido grava NULL como antes (Number → NaN → null).
      const idEmpresa =
        empresa_id && /^\d{1,10}$/.test(empresa_id) ? Number(empresa_id) : null

      // A fila manda `itemId:índice` por foto: reenvio após timeout não duplica a foto.
      const data = await withIdempotency(
        request,
        `upload:${idBase}`,
        async () => {
          const folder = type === '1' ? 'fotos' : 'assinatura'
          const filename =
            type === '1' ? `${randomUUID()}.jpg` : 'assinatura.jpg'

          const fullDirPath = path.join(
            ROOT_PATH,
            'files',
            idBase,
            idAtendimento,
            folder
          )

          await mkdir(fullDirPath, { recursive: true })
          await writeFile(path.join(fullDirPath, filename), file)

          await prisma.app_atendimento_photos.create({
            data: {
              ID_BASE: Number(idBase),
              id_empresa: idEmpresa,
              id_atendimento: Number(idAtendimento),
              type: Number(type),
              status: 1,
              create_at: new Date(),
              filename,
              path: `/${idBase}/${idAtendimento}/${folder}/`,
              description: null,
            },
          })

          return {
            path: `/files/${idBase}/${idAtendimento}/${folder}/${filename}`,
            filename,
          }
        }
      )

      return reply.send({ success: true, data })
    }
  )
}
