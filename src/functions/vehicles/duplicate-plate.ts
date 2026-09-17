/** Erro de placa já cadastrada, traduzido pelas rotas em HTTP 409. */
export class DuplicatePlateError extends Error {
  constructor() {
    super('Já existe um veículo com esta placa.')
    this.name = 'DuplicatePlateError'
  }
}

/**
 * Identifica violação do índice UNIQUE de `app_veiculos.placa`.
 *
 * As escritas de veículo usam `$executeRawUnsafe`, então o erro chega como
 * `PrismaClientKnownRequestError` P2010 embrulhando o erro do MySQL — e não como o
 * P2002 que o Prisma produz nas queries tipadas. Por isso a checagem olha o código
 * nativo (ER_DUP_ENTRY / 1062) além do código do Prisma.
 */
export function isDuplicatePlateError(error: unknown): boolean {
  const err = error as {
    code?: string
    meta?: { code?: string | number; message?: string }
    message?: string
  }

  if (err?.code === 'P2002') return true

  const nativeCode = err?.meta?.code
  if (nativeCode === 1062 || nativeCode === '1062') return true

  const text = `${err?.meta?.message ?? ''} ${err?.message ?? ''}`
  return text.includes('ER_DUP_ENTRY') || text.includes('Duplicate entry')
}
