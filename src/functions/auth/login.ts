import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { AppError } from '@/infra/http/error'

interface LoginParams {
  email: string
  passwordHash: string
}

interface UserRow {
  id: number
  user_name: string | null
  user_email: string | null
  user_password: string
  empresa_id: number | null
  tecnico_id: string | null
  empresa_logo: string | null
  filial_id: number | null
}

export async function loginFn({ email, passwordHash }: LoginParams) {
  const users = await prisma.$queryRaw<UserRow[]>`
    SELECT
      u.id,
      u.user_name,
      u.user_email,
      u.user_password,
      u.empresa_id,
      u.tecnico_id,
      u.filial_id,
      e.logo AS empresa_logo
    FROM users u
    LEFT JOIN empresas e ON e.id = u.empresa_id
    WHERE u.user_email = ${email}
    LIMIT 1
  `

  if (users.length === 0) {
    throw new AppError('Credenciais inválidas.', 401)
  }

  const user = users[0]

  if (!user.user_password) {
    throw new AppError('Credenciais inválidas.', 401)
  }

  const passwordMatch = await bcrypt.compare(passwordHash, user.user_password)
  if (!passwordMatch) {
    throw new AppError('Credenciais inválidas.', 401)
  }

  return {
    id: user.id,
    name: user.user_name,
    email: user.user_email,
    empresaId: user.empresa_id,
    tecnicoId: user.tecnico_id,
    empresaLogo: user.empresa_logo,
    filialId: user.filial_id,
  }
}
