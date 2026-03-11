import dotenv from 'dotenv'
import twilio from 'twilio'

dotenv.config()
// As variáveis de ambiente devem ser configuradas no seu .env para segurança
const accountSid = process.env.ACCOUNT
const authToken = process.env.AUTH

// Verifique se as credenciais estão configuradas corretamente
if (!accountSid || !authToken) {
  throw new Error('Twilio Account SID ou Auth Token não configurados')
}

export const client = twilio(accountSid, authToken)
