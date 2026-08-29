"use server";

import { revalidatePath } from "next/cache";
import { createClient, getOwner } from "@/lib/supabase/server";

export async function getWorkers(includeInactive = false) {
  const supabase = await createClient();
  const owner = await getOwner();
  if (!owner) return [];

  let query = supabase
    .from("workers")
    .select(
      `*, worker_farm_assignments(farm_id, farms(id, name, location_text, acres))`
    )
    .eq("owner_id", owner.id)
    .order("created_at", { ascending: false });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getWorker(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workers")
    .select(
      `*, worker_farm_assignments(farm_id, farms(id, name, location_text, acres))`
    )
    .eq("id", id)
    .single();

  return data;
}

export async function createWorker(data: {
  name: string;
  phone?: string;
  daily_wage: number;
  photo_url?: string;
  farm_ids: string[];
}) {
  const supabase = await createClient();
  const owner = await getOwner();
  if (!owner) return { error: "Not authenticated" };

  const { data: worker, error } = await supabase
    .from("workers")
    .insert({
      owner_id: owner.id,
      name: data.name,
      phone: data.phone || null,
      daily_wage: data.daily_wage,
      photo_url: data.photo_url || null,
      is_active: true,
    })
    .select()
    .single();

  if (error || !worker) return { error: error?.message ?? "Failed" };

  if (data.farm_ids.length > 0) {
    const assignments = data.farm_ids.map((farm_id) => ({
      worker_id: worker.id,
      farm_id,
    }));
    await supabase.from("worker_farm_assignments").insert(assignments);
  }

  revalidatePath("/workers");
  return { success: true, worker };
}

export async function updateWorker(
  id: string,
  data: {
    name: string;
    phone?: string;
    daily_wage: number;
    photo_url?: string;
    is_active: boolean;
    farm_ids: string[];
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workers")
    .update({
      name: data.name,
      phone: data.phone || null,
      daily_wage: data.daily_wage,
      photo_url: data.photo_url || null,
      is_active: data.is_active,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase
    .from("worker_farm_assignments")
    .delete()
    .eq("worker_id", id);

  if (data.farm_ids.length > 0) {
    const assignments = data.farm_ids.map((farm_id) => ({
      worker_id: id,
      farm_id,
    }));
    await supabase.from("worker_farm_assignments").insert(assignments);
  }

  revalidatePath("/workers");
  revalidatePath(`/workers/${id}`);
  return { success: true };
}

export async function toggleWorkerActive(id: string, is_active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workers")
    .update({ is_active })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/workers");
  return { success: true };
}

export async function uploadWorkerPhoto(
  workerId: string,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const owner = await getOwner();
  if (!owner) return { error: "Not authenticated" };

  const file = formData.get("photo") as File;
  if (!file) return { error: "No file" };

  const ext = "jpg";
  const path = `${owner.id}/${workerId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("worker-photos")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("worker-photos").getPublicUrl(path);

  await supabase
    .from("workers")
    .update({ photo_url: publicUrl })
    .eq("id", workerId);

  return { url: publicUrl };
}
