import { prisma } from '../../lib/prisma'

export async function registerExpoTokenRepository(
  idEmpresa: number,
  tecnicoId: string,
  token: string
) {
  // Busca os tokens de notificação dos usuários da empresa
  const users = await prisma.$queryRaw<
    { id: number; token: string; tecnico_id: string }[]
  >`
    UPDATE users SET token_2 = ${token} WHERE empresa_id = ${idEmpresa} AND tecnico_id = ${tecnicoId} LIMIT 1
  `

  // Verifica se encontrou algum usuário
  if (users.length === 0) {
    return { success: false, message: 'Nenhum usuário encontrado' }
  }

  return { success: true, message: 'Token atualizado!' }
}
