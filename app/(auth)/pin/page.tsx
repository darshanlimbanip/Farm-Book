"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { savePinHash } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function PinSetupPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (pin.length !== 4) return;
    if (pin !== confirmPin) {
      setError(t("pinMismatch"));
      return;
    }
    setLoading(true);
    const hash = await hashPin(pin);
    localStorage.setItem("farmbook_pin_hash", hash);
    await savePinHash(hash);
    setLoading(false);
    router.push("/");
    router.refresh();
  };

  const handleSkip = async () => {
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Lock className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold mb-2">{t("pinTitle")}</h1>
      <p className="text-muted text-sm mb-8 text-center">{t("pinSubtitle")}</p>

      <div className="w-full max-w-sm space-y-4">
        <div>
          <Label htmlFor="pin">{t("pinEnter")}</Label>
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="mt-2 text-2xl text-center tracking-[0.5em]"
          />
        </div>
        <div>
          <Label htmlFor="confirmPin">{t("pinConfirm")}</Label>
          <Input
            id="confirmPin"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={confirmPin}
            onChange={(e) =>
              setConfirmPin(e.target.value.replace(/\D/g, ""))
            }
            className="mt-2 text-2xl text-center tracking-[0.5em]"
          />
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSave}
          disabled={loading || pin.length !== 4}
        >
          {t("continue")}
        </Button>
        <Button variant="ghost" className="w-full" onClick={handleSkip}>
          {t("pinSkip")}
        </Button>
      </div>
    </div>
  );
}
