import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { clients } from "@/config/clients";

export default async function Home() {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.role === "client" && s.clientId) redirect(`/${s.clientId}`);
  redirect(`/${Object.keys(clients)[0]}/team`);
}
