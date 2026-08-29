"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function PinLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const t = useTranslations("auth");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleUnlock = async () => {
    const storedHash = localStorage.getItem("farmbook_pin_hash");
    if (!storedHash) {
      onUnlock();
      return;
    }
    const hash = await hashPin(pin);
    if (hash === storedHash) {
      onUnlock();
    } else {
      setError(t("pinWrong"));
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Lock className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold mb-8">{t("pinUnlock")}</h1>
      <div className="w-full max-w-sm space-y-4">
        <Input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          className="text-2xl text-center tracking-[0.5em]"
          autoFocus
        />
        {error && <p className="text-danger text-sm text-center">{error}</p>}
        <Button
          className="w-full"
          size="lg"
          onClick={handleUnlock}
          disabled={pin.length !== 4}
        >
          {t("pinUnlock")}
        </Button>
      </div>
    </div>
  );
}

export function PinLockProvider({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(true);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    const pinHash = localStorage.getItem("farmbook_pin_hash");
    setHasPin(!!pinHash);
    if (!pinHash) setLocked(false);
  }, []);

  if (hasPin && locked) {
    return <PinLockScreen onUnlock={() => setLocked(false)} />;
  }

  return <>{children}</>;
}
