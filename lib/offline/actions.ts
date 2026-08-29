"use server";

import type { OfflineActionType } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function syncOfflineAction(data: {
  type: OfflineActionType;
  action: "create" | "update" | "delete";
  payload: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { type, action, payload } = data;

  try {
    switch (type) {
      case "attendance": {
        if (action === "create" || action === "update") {
          const { error } = await supabase.from("attendance").upsert(
            {
              worker_id: payload.worker_id as string,
              farm_id: payload.farm_id as string,
              date: payload.date as string,
              status: payload.status as string,
            },
            { onConflict: "worker_id,date" }
          );
          if (error) return { success: false, error: error.message };
        }
        break;
      }
      case "advance": {
        if (action === "create") {
          const { error } = await supabase.from("advances").insert({
            worker_id: payload.worker_id as string,
            date: payload.date as string,
            amount: payload.amount as number,
            note: (payload.note as string) || null,
          });
          if (error) return { success: false, error: error.message };
        }
        break;
      }
      case "expense": {
        if (action === "create") {
          const { error } = await supabase.from("expenses").insert({
            owner_id: payload.owner_id as string,
            farm_id: (payload.farm_id as string) || null,
            date: payload.date as string,
            category: payload.category as string,
            amount: payload.amount as number,
            note: (payload.note as string) || null,
            photo_url: (payload.photo_url as string) || null,
          });
          if (error) return { success: false, error: error.message };
        } else if (action === "delete") {
          const { error } = await supabase
            .from("expenses")
            .delete()
            .eq("id", payload.id as string);
          if (error) return { success: false, error: error.message };
        }
        break;
      }
      case "income": {
        if (action === "create") {
          const { error } = await supabase.from("income").insert({
            owner_id: payload.owner_id as string,
            farm_id: (payload.farm_id as string) || null,
            date: payload.date as string,
            source_text: payload.source_text as string,
            amount: payload.amount as number,
            note: (payload.note as string) || null,
          });
          if (error) return { success: false, error: error.message };
        } else if (action === "delete") {
          const { error } = await supabase
            .from("income")
            .delete()
            .eq("id", payload.id as string);
          if (error) return { success: false, error: error.message };
        }
        break;
      }
      case "farm": {
        if (action === "create") {
          const { error } = await supabase.from("farms").insert({
            owner_id: payload.owner_id as string,
            name: payload.name as string,
            location_text: payload.location_text as string,
            acres: payload.acres as number,
          });
          if (error) return { success: false, error: error.message };
        } else if (action === "update") {
          const { error } = await supabase
            .from("farms")
            .update({
              name: payload.name as string,
              location_text: payload.location_text as string,
              acres: payload.acres as number,
            })
            .eq("id", payload.id as string);
          if (error) return { success: false, error: error.message };
        } else if (action === "delete") {
          const { error } = await supabase
            .from("farms")
            .delete()
            .eq("id", payload.id as string);
          if (error) return { success: false, error: error.message };
        }
        break;
      }
      case "worker": {
        if (action === "create") {
          const { error } = await supabase.from("workers").insert({
            owner_id: payload.owner_id as string,
            name: payload.name as string,
            phone: (payload.phone as string) || null,
            daily_wage: payload.daily_wage as number,
            photo_url: (payload.photo_url as string) || null,
            is_active: true,
          });
          if (error) return { success: false, error: error.message };
        } else if (action === "update") {
          const { error } = await supabase
            .from("workers")
            .update({
              name: payload.name as string,
              phone: (payload.phone as string) || null,
              daily_wage: payload.daily_wage as number,
              photo_url: (payload.photo_url as string) || null,
              is_active: payload.is_active as boolean,
            })
            .eq("id", payload.id as string);
          if (error) return { success: false, error: error.message };
        }
        break;
      }
      case "worker_farm_assignment": {
        if (action === "create") {
          const { error } = await supabase
            .from("worker_farm_assignments")
            .insert({
              worker_id: payload.worker_id as string,
              farm_id: payload.farm_id as string,
            });
          if (error) return { success: false, error: error.message };
        } else if (action === "delete") {
          const { error } = await supabase
            .from("worker_farm_assignments")
            .delete()
            .eq("worker_id", payload.worker_id as string)
            .eq("farm_id", payload.farm_id as string);
          if (error) return { success: false, error: error.message };
        }
        break;
      }
    }
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
