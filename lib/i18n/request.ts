import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const locales = ["gu", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "gu";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale")?.value;
  const locale: Locale =
    localeCookie === "en" || localeCookie === "gu" ? localeCookie : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
