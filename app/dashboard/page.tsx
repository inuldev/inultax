import { redirect } from "next/navigation";

import { signOut } from "../utils/auth";
import { requireUser } from "../utils/hooks";

export default async function DashboardRoute() {
  const session = await requireUser();

  return (
    <>
      <h1>Halo, {session.user?.email}</h1>
      <form
        action={async () => {
          "use server";
          await signOut();
          redirect("/");
        }}
      >
        <button type="submit">Keluar</button>
      </form>
    </>
  );
}
