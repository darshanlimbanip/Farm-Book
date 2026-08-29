"use server";

import { revalidatePath } from "next/cache";
import { createClient, getOwner } from "@/lib/supabase/server";

export async function getFarms() {
  const supabase = await createClient();
  const owner = await getOwner();
  if (!owner) return [];

  const { data } = await supabase
    .from("farms")
    .select("*")
    .eq("owner_id", owner.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createFarm(data: {
  name: string;
  location_text: string;
  acres: number;
}) {
  const supabase = await createClient();
  const owner = await getOwner();
  if (!owner) return { error: "Not authenticated" };

  const { error } = await supabase.from("farms").insert({
    owner_id: owner.id,
    name: data.name,
    location_text: data.location_text,
    acres: data.acres,
  });

  if (error) return { error: error.message };
  revalidatePath("/farms");
  return { success: true };
}

export async function updateFarm(
  id: string,
  data: { name: string; location_text: string; acres: number }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("farms")
    .update(data)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/farms");
  return { success: true };
}

export async function deleteFarm(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("farms").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/farms");
  return { success: true };
}
