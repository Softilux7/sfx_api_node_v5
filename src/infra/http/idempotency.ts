import type { FastifyRequest } from 'fastify'

/**
 * Honra o header `Idempotency-Key` que o app já manda nas escritas reenviáveis (create do
 * atendimento = `tempId`, etapas da fila = `itemId`, fotos = `itemId:índice`).
 *
 * Sem isso, um timeout do app depois de o servidor já ter gravado virava registro duplicado:
 * o app reenviava e o servidor gravava de novo. Aqui a segunda requisição com a mesma chave
 * recebe o resultado da primeira — inclusive enquanto a primeira ainda está em andamento,
 * porque o que fica guardado é a promise.
 *
 * Em memória de propósito (sem tabela nova): vale enquanto o processo vive e **só funciona
 * com uma instância** no PM2 (`instances: 1`). Falha não fica guardada — a próxima tentativa
 * executa de novo.
 */

type Entry = { promise: Promise<unknown>; expiresAt: number }

const TTL_MS = 48 * 60 * 60 * 1000
const MAX_ENTRIES = 5000
const MAX_KEY_LENGTH = 200

const cache = new Map<string, Entry>()

function prune(now: number) {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key)
  }
  // Map preserva a ordem de inserção: o primeiro é o mais antigo.
  while (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
}

export function withIdempotency<T>(
  request: FastifyRequest,
  scope: string,
  run: () => Promise<T>
): Promise<T> {
  const header = request.headers['idempotency-key']
  const key = typeof header === 'string' ? header.trim() : ''

  if (!key || key.length > MAX_KEY_LENGTH) return run()

  const cacheKey = `${scope}:${key}`
  const now = Date.now()
  const hit = cache.get(cacheKey)

  if (hit && hit.expiresAt > now) {
    request.log.info(
      { idempotencyKey: key, scope },
      'requisição repetida: devolvendo o resultado da primeira'
    )
    return hit.promise as Promise<T>
  }

  prune(now)

  const promise = run()
  cache.set(cacheKey, { promise, expiresAt: now + TTL_MS })
  promise.catch(() => {
    if (cache.get(cacheKey)?.promise === promise) cache.delete(cacheKey)
  })

  return promise
}
