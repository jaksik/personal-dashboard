import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <main className="w-full max-w-3xl rounded-xl border border-foreground/15 bg-background p-8">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <p className="mt-3 text-foreground/70">
          You are signed in as {user.email ?? "Unknown user"}.
        </p>
        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="rounded-md bg-foreground px-4 py-2 text-background"
          >
            Sign out
          </button>
        </form>
      </main>
    </div>
  );
}
