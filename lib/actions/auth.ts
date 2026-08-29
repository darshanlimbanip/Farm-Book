"use server";

import { cookies } from "next/headers";
import { createClient, getOwner } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Locale } from "@/lib/types";

const DEV_OTP = process.env.DEV_OTP ?? "123456";
const DEV_PASSWORD = process.env.DEV_USER_PASSWORD ?? "farmbook-dev-password";

function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("91") ? `+${digits}` : `+91${digits}`;
}

function isDevBypassAllowed(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_AUTH_BYPASS === "true"
  );
}

function phoneToDevEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `dev+${digits}@farmbook.local`;
}

async function getOrCreateDevUser(phone: string) {
  const admin = createAdminClient();
  const email = phoneToDevEmail(phone);

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: DEV_PASSWORD,
      user_metadata: { phone },
    });

  if (!createError && created.user) {
    return created.user;
  }

  if (
    !createError?.message.toLowerCase().includes("already") &&
    !createError?.message.toLowerCase().includes("registered")
  ) {
    throw new Error(createError?.message ?? "Failed to create user");
  }

  let page = 1;
  while (page <= 10) {
    const { data: listData, error: listError } =
      await admin.auth.admin.listUsers({ page, perPage: 100 });

    if (listError) throw new Error(listError.message);

    const existing = listData.users.find((u) => u.email === email);
    if (existing) return existing;

    if (listData.users.length < 100) break;
    page++;
  }

  throw new Error("Could not find dev user");
}

export async function devBypassLogin(
  phone: string,
  otp: string
): Promise<{ success?: boolean; needsSetup?: boolean; error?: string }> {
  if (!isDevBypassAllowed()) {
    return { error: "Dev auth bypass is disabled" };
  }

  if (otp !== DEV_OTP) {
    return { error: "Invalid OTP" };
  }

  try {
    const formattedPhone = formatPhoneE164(phone);
    const devEmail = phoneToDevEmail(formattedPhone);
    const admin = createAdminClient();
    const user = await getOrCreateDevUser(formattedPhone);

    await admin.auth.admin.updateUserById(user.id, {
      password: DEV_PASSWORD,
      user_metadata: { phone: formattedPhone },
    });

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: DEV_PASSWORD,
    });

    if (signInError) {
      return { error: signInError.message };
    }

    const { data: owner } = await supabase
      .from("owners")
      .select("name")
      .eq("id", user.id)
      .single();

    return { success: true, needsSetup: !owner?.name };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dev login failed";
    const cause =
      e instanceof Error && e.cause instanceof Error
        ? e.cause.message
        : "";

    if (
      message.includes("fetch failed") ||
      cause.includes("ENOTFOUND") ||
      cause.includes("ECONNREFUSED") ||
      cause.includes("UND_ERR_CONNECT_TIMEOUT") ||
      cause.includes("Connect Timeout")
    ) {
      return {
        error:
          "Cannot reach Supabase (network/DNS). Open the dashboard, restore the project if it is paused, then retry. URL in .env.local should be https://YOUR-REF.supabase.co with no /rest/v1/.",
      };
    }

    return { error: message };
  }
}

export async function setLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}

export async function updateOwnerLanguage(locale: Locale) {
  const supabase = await createClient();
  const owner = await getOwner();
  if (!owner) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("owners")
    .update({ preferred_language: locale })
    .eq("id", owner.id);

  if (error) return { error: error.message };
  await setLocale(locale);
  return { success: true };
}

export async function completeProfile(data: {
  name: string;
  preferred_language: Locale;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const metadata = user.user_metadata as { phone?: string } | undefined;
  const phone = user.phone ?? metadata?.phone ?? "";
  const { error } = await supabase.from("owners").upsert({
    id: user.id,
    phone,
    name: data.name,
    preferred_language: data.preferred_language,
  });

  if (error) return { error: error.message };
  await setLocale(data.preferred_language);
  return { success: true };
}

export async function savePinHash(pinHash: string | null) {
  const supabase = await createClient();
  const owner = await getOwner();
  if (!owner) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("owners")
    .update({ pin_hash: pinHash })
    .eq("id", owner.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
