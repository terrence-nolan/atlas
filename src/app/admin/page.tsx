import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth/admin";
import { signOut } from "./actions";

async function AdminContent() {
  await requireAdmin();

  return (
    <div>
      <p>You are signed in as the Atlas administrator.</p>

      <form action={signOut}>
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  return (
    <main>
      <h1>Admin</h1>

      <Suspense fallback={<p>Checking authentication...</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}