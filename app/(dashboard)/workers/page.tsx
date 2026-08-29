import { getWorkers } from "@/lib/actions/workers";
import { getFarms } from "@/lib/actions/farms";
import { getOwner } from "@/lib/supabase/server";
import { WorkersClient } from "@/components/workers/WorkersClient";
import { redirect } from "next/navigation";

export default async function WorkersPage() {
  const owner = await getOwner();
  if (!owner) redirect("/login");

  const [workers, farms] = await Promise.all([
    getWorkers(true),
    getFarms(),
  ]);

  return (
    <WorkersClient workers={workers} farms={farms} ownerId={owner.id} />
  );
}
