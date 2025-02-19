import twilio from 'twilio';
import { env } from '../env';

// As variáveis de ambiente devem ser configuradas no seu .env para segurança
const accountSid = env.ACCOUNT;
const authToken = env.AUTH;

// Verifique se as credenciais estão configuradas corretamente
if (!accountSid || !authToken) {
  throw new Error('Twilio Account SID ou Auth Token não configurados');
}

export const client = twilio(accountSid, authToken);