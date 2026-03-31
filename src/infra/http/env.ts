import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string().startsWith('mysql://'),
  PORT: z.coerce.number().default(3309),
  ACCOUNT: z.string(),
  AUTH: z.string(),
  JWT_SECRET: z.string().default('super-secret-dev-key'),
})

export const env = envSchema.parse(process.env)
