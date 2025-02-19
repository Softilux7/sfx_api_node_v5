import twilio from 'twilio';

// As variáveis de ambiente devem ser configuradas no seu .env para segurança
const accountSid = 'ACe03fc6282bb0c24b829c28dfdcfd6043';
const authToken = '28ebfae35dd13c66c939bfadc2700288';

// Verifique se as credenciais estão configuradas corretamente
if (!accountSid || !authToken) {
  throw new Error('Twilio Account SID ou Auth Token não configurados');
}

export const client = twilio(accountSid, authToken);