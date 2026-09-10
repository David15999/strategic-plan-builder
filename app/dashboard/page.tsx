import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Tour, { HelpButton } from "@/components/Tour";
import SignOutButton from "@/components/SignOutButton";
import PlanManager, { type Plan } from "@/components/PlanManager";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: plans } = await supabase
    .from("plans")
    .select("id, name, updated_at")
    .order("updated_at", { ascending: false });

  const username = user.email?.split("@")[0] ?? "invitado";

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-8">
      <Tour tourId="dashboard" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis planes estratégicos</h1>
        <div className="flex items-center gap-3 text-sm">
          <HelpButton tourId="dashboard" />
          <span className="opacity-60">👤 {username}</span>
          <SignOutButton />
        </div>
      </div>

      <PlanManager initialPlans={(plans ?? []) as Plan[]} />
    </main>
  );
}
