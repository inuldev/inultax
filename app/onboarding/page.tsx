import { redirect } from "next/navigation";

import OnboardingForm from "@/app/components/OnboardingForm";

import { requireUser, checkUserOnboardingStatus } from "../utils/hooks";

export default async function Onboarding() {
  // Pastikan user sudah login sebelum mengakses onboarding
  const session = await requireUser();

  // Cek apakah user sudah menyelesaikan onboarding
  if (!session.user?.id) {
    redirect("/login");
  }

  const { isCompleted } = await checkUserOnboardingStatus(session.user.id);

  // Jika sudah lengkap, redirect ke dashboard
  if (isCompleted) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
