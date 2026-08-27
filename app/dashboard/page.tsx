import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

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

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis planes estratégicos</h1>
        <span className="text-sm opacity-60">{user.email}</span>
      </div>

      <form action={createPlan} className="flex gap-2">
        <input
          name="name"
          placeholder="Nombre de la empresa / proyecto"
          className="flex-1 rounded-lg border px-4 py-2"
        />
        <button className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700">
          Nuevo plan
        </button>
      </form>

      <ul className="space-y-2">
        {(plans ?? []).map((p) => (
          <li key={p.id}>
            <Link
              href={`/plan/${p.id}/paso/1`}
              className="block rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <span className="font-medium">{p.name}</span>
              <span className="block text-sm opacity-60">
                Actualizado: {new Date(p.updated_at).toLocaleDateString("es")}
              </span>
            </Link>
          </li>
        ))}
        {(plans ?? []).length === 0 && (
          <p className="opacity-60">Todavía no tenés planes. Creá el primero.</p>
        )}
      </ul>
    </main>
  );
}
