import { signOut } from "../utils/auth";
import { requireUser } from "../utils/hooks";

export default async function DashboardRoute() {
  const session = await requireUser();
  console.log(session);

  return (
    <>
      <h1>hello from the dashboard route</h1>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    </>
  );
}
