"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { completeProfile, devBypassLogin } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { Sprout } from "lucide-react";
import type { Locale } from "@/lib/types";

const DEV_AUTH_BYPASS =
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";
const DEV_OTP = process.env.NEXT_PUBLIC_DEV_OTP ?? "123456";

type Step = "phone" | "otp" | "setup";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<Locale>("gu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 10;

  const formatPhone = (p: string) => {
    const digits = p.replace(/\D/g, "");
    return digits.startsWith("91") ? `+${digits}` : `+91${digits}`;
  };

  const sendOtp = async () => {
    setLoading(true);
    setError("");

    if (DEV_AUTH_BYPASS) {
      setLoading(false);
      setStep("otp");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: formatPhone(phone),
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setStep("otp");
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");

    if (DEV_AUTH_BYPASS) {
      const result = await devBypassLogin(phone, otp);
      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.needsSetup) {
        setStep("setup");
      } else {
        router.push("/");
        router.refresh();
      }
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatPhone(phone),
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    const { data: owner } = await supabase
      .from("owners")
      .select("name")
      .eq("id", data.user?.id ?? "")
      .single();

    if (!owner?.name) {
      setStep("setup");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleSetup = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const result = await completeProfile({
      name: name.trim(),
      preferred_language: language,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/pin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex justify-end p-4">
        <LanguageToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Sprout className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-8">{tCommon("appName")}</h1>

        {step === "phone" && (
          <form
            className="w-full max-w-sm space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (isPhoneValid && !loading) sendOtp();
            }}
          >
            <div>
              <Label htmlFor="phone">{t("phoneLabel")}</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder={t("phonePlaceholder")}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="mt-2 text-lg"
              />
            </div>
            {DEV_AUTH_BYPASS && (
              <p className="text-sm text-muted text-center bg-secondary/10 rounded-lg p-3">
                Dev mode — any 10-digit number, OTP: <strong>{DEV_OTP}</strong>
              </p>
            )}
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !isPhoneValid}
            >
              {t("sendOtp")}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <div className="w-full max-w-sm space-y-4">
            <div>
              <Label htmlFor="otp">{t("otpLabel")}</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder={t("otpPlaceholder")}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-2 text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            {DEV_AUTH_BYPASS && (
              <p className="text-sm text-muted text-center bg-secondary/10 rounded-lg p-3">
                Dev mode — use OTP: <strong>{DEV_OTP}</strong>
              </p>
            )}
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button
              className="w-full"
              size="lg"
              onClick={verifyOtp}
              disabled={loading || otp.length < (DEV_AUTH_BYPASS ? 4 : 6)}
            >
              {t("verifyOtp")}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setStep("phone")}
            >
              {tCommon("back")}
            </Button>
          </div>
        )}

        {step === "setup" && (
          <div className="w-full max-w-sm space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">{t("setupTitle")}</h2>
              <p className="text-muted text-sm mt-1">{t("setupSubtitle")}</p>
            </div>
            <div>
              <Label htmlFor="name">{t("nameLabel")}</Label>
              <Input
                id="name"
                placeholder={t("namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>{t("languageLabel")}</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={language === "gu" ? "default" : "outline"}
                  onClick={() => setLanguage("gu")}
                  className="flex-1"
                >
                  {tCommon("languageGu")}
                </Button>
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  onClick={() => setLanguage("en")}
                  className="flex-1"
                >
                  {tCommon("languageEn")}
                </Button>
              </div>
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button
              className="w-full"
              size="lg"
              onClick={handleSetup}
              disabled={loading || !name.trim()}
            >
              {t("continue")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
