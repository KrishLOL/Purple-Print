"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function completeOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const disciplineId = formData.get("disciplineId");
  const gradYear = formData.get("gradYear");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      disciplineId: typeof disciplineId === "string" && disciplineId ? disciplineId : null,
      gradYear: typeof gradYear === "string" && gradYear ? Number.parseInt(gradYear, 10) : null,
      hasOnboarded: true,
    },
  });

  redirect("/");
}

export async function skipOnboarding() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { hasOnboarded: true },
  });

  redirect("/");
}
