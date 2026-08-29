"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createIncome } from "@/lib/actions/income";
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
import { cn } from "@/lib/utils";
import type { Farm } from "@/lib/types";

const schema = z.object({
  amount: z.coerce.number().min(1),
  source_text: z.string().min(1),
  note: z.string().optional(),
  date: z.string(),
});

type FormData = z.infer<typeof schema>;

interface IncomeFormSheetProps {
  open: boolean;
  onClose: () => void;
  farms: Farm[];
  ownerId: string;
}

export function IncomeFormSheet({
  open,
  onClose,
  farms,
  ownerId,
}: IncomeFormSheetProps) {
  const t = useTranslations("income");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { isOnline } = useOfflineStore();
  const [loading, setLoading] = useState(false);
  const [farmId, setFarmId] = useState<string>("");

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      source_text: "",
      note: "",
      date: toISODate(new Date()),
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const payload = {
      owner_id: ownerId,
      farm_id: farmId || undefined,
      date: data.date,
      source_text: data.source_text,
      amount: data.amount,
      note: data.note,
    };

    if (!isOnline) {
      await enqueueOfflineAction({
        id: crypto.randomUUID(),
        type: "income",
        action: "create",
        payload,
      });
    } else {
      await createIncome(payload);
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
          <SheetTitle>{t("addIncome")}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label>{tCommon("amount")}</Label>
            <Input
              inputMode="numeric"
              {...register("amount")}
              className="mt-2 text-2xl text-center font-bold"
            />
          </div>
          <div>
            <Label htmlFor="source">{t("sourceLabel")}</Label>
            <Input
              id="source"
              {...register("source_text")}
              placeholder={t("sourcePlaceholder")}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="idate">{tCommon("date")}</Label>
            <Input id="idate" type="date" {...register("date")} className="mt-2" />
          </div>
          {farms.length > 0 && (
            <div>
              <Label>{tCommon("farm")}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {farms.map((farm) => (
                  <button
                    key={farm.id}
                    type="button"
                    onClick={() => setFarmId(farm.id)}
                    className={cn(
                      "px-3 py-2 rounded-full text-sm border min-h-10",
                      farmId === farm.id
                        ? "bg-primary text-white"
                        : "bg-card border-border"
                    )}
                  >
                    {farm.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="inote">{tCommon("note")}</Label>
            <Input id="inote" {...register("note")} className="mt-2" />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {tCommon("save")}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
