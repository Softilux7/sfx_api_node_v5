import { prisma } from "../../lib/prisma";


export async function getAllOrdersRepository(idTecnico: string, idBase: number, status: string, seqos?: number) {

    // Monta a base da query
    let query = `
    SELECT 
    c.id, c.CDEMPRESA, c.empresa_id, c.SEQOS, c.STATUS, c.CDSTATUS, c.SEQCONTRATO, c.CDEQUIPAMENTO,
    c.CDCLIENTE, c.NMCLIENTE, c.ENDERECO, c.CIDADE, c.BAIRRO, c.UF, c.CEP, c.NUM, c.CONTATO, c.DTINCLUSAO, c.HRINCLUSAO, 
    c.DTPREVENTREGA, c.HRPREVENTREGA, c.DTATENDIMENTO, c.DDD, c.FONE, c.EMAIL, c.OBSDEFEITOCLI, c.OBSDEFEITOATS,
    e.SERIE, e.MODELO, e.DEPARTAMENTO, e.LOCALINSTAL, e.PATRIMONIO, e.SEQCONTRATO,
    pi.QUANTIDADE, pi.CDPRODUTO, p.NMPRODUTO, emp.empresa_fantasia
    FROM chamados c
    LEFT JOIN equipamentos e ON c.CDEQUIPAMENTO = e.CDEQUIPAMENTO AND e.ID_BASE = ${idBase}
    LEFT JOIN chamados_itens pi ON c.SEQOS = pi.SEQOS AND pi.ID_BASE = ${idBase}
    LEFT JOIN produtos p ON pi.CDPRODUTO = p.CDPRODUTO
    LEFT JOIN empresas emp ON c.empresa_id = emp.id
    WHERE c.NMSUPORTET = '${idTecnico}'
    AND c.ID_BASE = ${idBase}
    AND c.TFLIBERADO = 'S'
    `;

    // Adiciona a cláusula do status somente se fornecido
    if (status && status.trim() !== '') {
    query += ` AND c.STATUS = '${status}'`;
    }

    // Adicionar a cláusula de seqos somente se fornecida
    if (seqos && seqos !== undefined) {
    query += ` AND c.SEQOS = '${seqos}' `
    }

    query += `
    ORDER BY c.DTINCLUSAO DESC, c.HRINCLUSAO DESC
    LIMIT 30
    `;

// Executa a query
const chamados: any[] = await prisma.$queryRawUnsafe(query);

    // Transformação dos dados para o formato desejado
    const formattedData = chamados.reduce((acc, chamado) => {
        let existingOrder = acc.find((item: any) => item.sequence === chamado.id);

        if (!existingOrder) {
            existingOrder = {
                sequence: chamado.id,
                seqos: chamado.SEQOS,
                openDate: chamado.DTINCLUSAO || null,
                status: chamado.STATUS,
                cdstatus: chamado.CDSTATUS,
                cdempresa: chamado.empresa_id,
                company: chamado.empresa_fantasia,
                client: {
                    code: chamado.CDCLIENTE,
                    nmcliente: chamado.NMCLIENTE,
                    endereco: chamado.ENDERECO,
                    bairro: chamado.BAIRRO,
                    cep: chamado.CEP,
                    uf: chamado.UF,
                    cidade: chamado.CIDADE,
                    num: chamado.NUM,
                    fone: `${chamado.DDD} ${chamado.FONE}`,
                    email: chamado.EMAIL,
                },
                equipment: {
                    code: chamado.CDEQUIPAMENTO?.toString() || null,
                    serial: chamado.SERIE || null,
                    model: chamado.MODELO || null,
                    obsdefectcli: chamado.OBSDEFEITOCLI || null,
                    obsdefectats: chamado.OBSDEFEITOATS || null
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



