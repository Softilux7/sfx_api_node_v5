import { prisma } from '../lib/prisma';

export async function getAllOrdersRepository(idTecnico: string, idBase: number, status: string) {

    // Busca por todos os chamados do técnico e faz a formatação dos dados
    const chamados: any[] = await prisma.$queryRaw`
    SELECT 
      c.id, c.CDEMPRESA, c.empresa_id, c.SEQOS, c.STATUS, c.CDSTATUS, c.SEQCONTRATO, c.CDEQUIPAMENTO,
      c.CDCLIENTE, c.NMCLIENTE, c.CONTATO, c.DTINCLUSAO, c.HRINCLUSAO, c.DTPREVENTREGA, c.HRPREVENTREGA, c.DTATENDIMENTO,
      e.SERIE, e.MODELO, e.DEPARTAMENTO, e.LOCALINSTAL, e.PATRIMONIO, e.SEQCONTRATO,
      pi.QUANTIDADE, pi.CDPRODUTO, p.NMPRODUTO, emp.empresa_fantasia
    FROM chamados c
    LEFT JOIN equipamentos e ON c.CDEQUIPAMENTO = e.CDEQUIPAMENTO AND e.ID_BASE = ${idBase}
    LEFT JOIN chamados_itens pi ON c.SEQOS = pi.SEQOS AND pi.ID_BASE = ${idBase} AND pi.TFPENDENTE = 'S'
    LEFT JOIN produtos p ON pi.CDPRODUTO = p.CDPRODUTO
    LEFT JOIN empresas emp ON c.empresa_id = emp.id
    WHERE c.NMSUPORTET = ${idTecnico}
    AND c.ID_BASE = ${idBase}
    AND c.TFLIBERADO = 'S'
    AND c.STATUS = ${status}
    LIMIT 30
  `;

    // Transformação dos dados para o formato desejado
    const formattedData = chamados.reduce((acc, chamado) => {
        let existingOrder = acc.find((item: any) => item.sequence === chamado.id);

        if (!existingOrder) {
            existingOrder = {
                sequence: chamado.id,
                seqos: chamado.SEQOS,
                openDate: chamado.DTINCLUSAO?.toISOString() || null,
                status: chamado.STATUS,
                cdstatus: chamado.CDSTATUS,
                cdempresa: chamado.empresa_id,
                company: chamado.empresa_fantasia,
                client: {
                    code: chamado.CDCLIENTE,
                    nmcliente: chamado.NMCLIENTE,
                },
                equipment: {
                    code: chamado.CDEQUIPAMENTO?.toString() || null,
                    serial: chamado.SERIE || null,
                    model: chamado.MODELO || null,
                },
                parts: [],
            };
            acc.push(existingOrder);
        }

        // Se houver uma peça associada, adiciona à lista de parts
        if (chamado.CDPRODUTO) {
            existingOrder.parts.push({
                quantidade: chamado.QUANTIDADE || 0,
                cdproduto: chamado.CDPRODUTO,
                nmproduto: chamado.NMPRODUTO,
            });
        }

        return acc;
    }, [] as any[]);

    return formattedData
}



