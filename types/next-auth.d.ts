import type { Role } from "@/app/generated/prisma/client";

declare module "next-auth" {
  interface User {
    role?: Role;
    disciplineId?: string | null;
    gradYear?: number | null;
    hasOnboarded?: boolean;
    isBanned?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      disciplineId: string | null;
      gradYear: number | null;
      hasOnboarded: boolean;
      isBanned: boolean;
    };
  }
}
