import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Tour, { HelpButton } from "@/components/Tour";
import SignOutButton from "@/components/SignOutButton";

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

  async function createPlan(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const name = (formData.get("name") as string) || "Mi plan estratégico";
    const { data, error } = await supabase
      .from("plans")
      .insert({ user_id: user.id, name })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "No se pudo crear");
    redirect(`/plan/${data.id}/paso/1`);
  }

  async function renamePlan(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const name = (formData.get("name") as string)?.trim();
    if (id && name) await supabase.from("plans").update({ name }).eq("id", id);
    revalidatePath("/dashboard");
  }

  async function deletePlan(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    if (id) await supabase.from("plans").delete().eq("id", id);
    revalidatePath("/dashboard");
  }

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

      <form action={createPlan} className="flex gap-2" data-tour="new-plan">
        <input
          name="name"
          placeholder="Nombre de la empresa / proyecto"
          className="flex-1 rounded-lg border px-4 py-2"
        />
        <button className="rounded-lg bg-[#1F2465] text-white px-4 py-2 font-medium hover:bg-[#3a4487]">
          Nuevo plan
        </button>
      </form>

      <ul className="space-y-3">
        {(plans ?? []).map((p, i) => (
          <li
            key={p.id}
            className="rounded-lg border p-4 space-y-3"
            data-tour={i === 0 ? "plan-card" : undefined}
          >
            <Link href={`/plan/${p.id}/paso/1`} className="block hover:opacity-80">
              <span className="font-medium text-lg">{p.name}</span>
              <span className="block text-sm opacity-60">
                Actualizado: {new Date(p.updated_at).toLocaleDateString("es")}
              </span>
            </Link>
            <div
              className="flex flex-wrap items-center gap-2 text-sm"
              data-tour={i === 0 ? "plan-actions" : undefined}
            >
              <Link
                href={`/plan/${p.id}/paso/1`}
                className="rounded bg-[#1F2465] text-white px-3 py-1 hover:bg-[#3a4487]"
              >
                Abrir
              </Link>
              <Link
                href={`/plan/${p.id}/resumen`}
                className="rounded border px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Resumen
              </Link>
              <form action={renamePlan} className="flex gap-1">
                <input type="hidden" name="id" value={p.id} />
                <input
                  name="name"
                  placeholder="Nuevo nombre…"
                  className="rounded border px-2 py-1 w-40"
                />
                <button className="rounded border px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-900">
                  Renombrar
                </button>
              </form>
              <form action={deletePlan} className="ml-auto">
                <input type="hidden" name="id" value={p.id} />
                <button className="rounded border border-red-300 text-red-600 px-3 py-1 hover:bg-red-50">
                  🗑 Borrar
                </button>
              </form>
            </div>
          </li>
        ))}
        {(plans ?? []).length === 0 && (
          <p className="opacity-60">Todavía no tenés planes. Creá el primero.</p>
        )}
      </ul>
    </main>
  );
}
