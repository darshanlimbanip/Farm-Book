import { getFarms } from "@/lib/actions/farms";
import { getOwner } from "@/lib/supabase/server";
import { FarmsClient } from "@/components/farms/FarmsClient";
import { redirect } from "next/navigation";

export default async function FarmsPage() {
  const owner = await getOwner();
  if (!owner) redirect("/login");

  const farms = await getFarms();

  return <FarmsClient farms={farms} ownerId={owner.id} />;
}
