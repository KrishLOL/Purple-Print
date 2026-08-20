import type { Prisma } from "@/app/generated/prisma/client";

type Tx = Prisma.TransactionClient;

export async function logModerationAction(
  tx: Tx,
  params: { actorId: string; action: string; targetType: string; targetId: string; reason: string },
) {
  await tx.moderationLog.create({ data: params });
}
