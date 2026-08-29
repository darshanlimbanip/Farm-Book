"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAdvance } from "@/lib/actions/advances";
import { enqueueOfflineAction } from "@/lib/offline/db";
import { useOfflineStore } from "@/lib/offline/store";
import { toISODate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const schema = z.object({
  amount: z.coerce.number().min(1),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AdvanceFormSheetProps {
  open: boolean;
  onClose: () => void;
  workerId: string;
}

export function AdvanceFormSheet({
  open,
  onClose,
  workerId,
}: AdvanceFormSheetProps) {
  const t = useTranslations("advances");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { isOnline } = useOfflineStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, note: "" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const payload = {
      worker_id: workerId,
      date: toISODate(new Date()),
      amount: data.amount,
      note: data.note,
    };

    if (!isOnline) {
      await enqueueOfflineAction({
        id: crypto.randomUUID(),
        type: "advance",
        action: "create",
        payload,
      });
    } else {
      await createAdvance(payload);
    }

    setLoading(false);
    reset();
    onClose();
    router.refresh();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("addAdvance")}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="amount">{t("amountLabel")}</Label>
            <Input
              id="amount"
              inputMode="numeric"
              {...register("amount")}
              className="mt-2 text-2xl text-center font-bold"
            />
          </div>
          <div>
            <Label htmlFor="note">{tCommon("note")}</Label>
            <Input
              id="note"
              {...register("note")}
              placeholder={t("notePlaceholder")}
              className="mt-2"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {tCommon("save")}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
