import { redirect } from "next/navigation";

import prisma from "./db";
import { auth } from "./auth";

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function checkUserOnboardingStatus(userId: string) {
  const userData = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      firstName: true,
      lastName: true,
      address: true,
    },
  });

  return {
    isCompleted: !!(
      userData?.firstName &&
      userData.lastName &&
      userData.address
    ),
    userData,
  };
}
