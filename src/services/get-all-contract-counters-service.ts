import { prisma } from '../lib/prisma';

export async function getAllContractCounters(idBase: number, empresaId: number, seqContrato: number | null, cdEquipamento: number) {

    const contractCounters = await prisma.contrato_itens_med.findMany({
      where: {
        ID_BASE: idBase,
        empresa_id: empresaId,
        CDEQUIPAMENTO: cdEquipamento,
        SEQCONTRATO: seqContrato,
        TFMEDIDORATIVO: 'S',
      },
      select: {
        CDMEDIDOR: true,
      },
    })

    // Extrai os MEDIDORES como array
    return contractCounters.map((contractCounters) => contractCounters.CDMEDIDOR);
  }