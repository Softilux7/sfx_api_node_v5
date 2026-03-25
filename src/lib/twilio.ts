import { env } from '@/infra/http/env'
import twilio from 'twilio'

export const client = twilio(env.ACCOUNT, env.AUTH)
