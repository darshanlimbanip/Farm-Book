"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createExpense } from "@/lib/actions/expenses";
import { enqueueOfflineAction } from "@/lib/offline/db";
import { useOfflineStore } from "@/lib/offline/store";
import { toISODate, compressImage } from "@/lib/utils";
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
import type { ExpenseCategory, Farm } from "@/lib/types";

const CATEGORIES: ExpenseCategory[] = [
  "fuel",
  "fertilizer",
  "seeds",
  "equipment",
  "labor_other",
  "misc",
];

const schema = z.object({
  amount: z.coerce.number().min(1),
  note: z.string().optional(),
  date: z.string(),
});

type FormData = z.infer<typeof schema>;

interface ExpenseFormSheetProps {
  open: boolean;
  onClose: () => void;
  farms: Farm[];
  ownerId: string;
}

export function ExpenseFormSheet({
  open,
  onClose,
  farms,
  ownerId,
}: ExpenseFormSheetProps) {
  const t = useTranslations("expenses");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { isOnline } = useOfflineStore();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("fuel");
  const [farmId, setFarmId] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, note: "", date: toISODate(new Date()) },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    let photo_url: string | undefined;

    if (photoFile) {
      const compressed = await compressImage(photoFile);
      photo_url = URL.createObjectURL(compressed);
    }

    const payload = {
      owner_id: ownerId,
      farm_id: farmId || undefined,
      date: data.date,
      category,
      amount: data.amount,
      note: data.note,
      photo_url,
    };

    if (!isOnline) {
      await enqueueOfflineAction({
        id: crypto.randomUUID(),
        type: "expense",
        action: "create",
        payload,
      });
    } else {
      await createExpense(payload);
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
          <SheetTitle>{t("addExpense")}</SheetTitle>
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
            <Label>{tCommon("category")}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium border min-h-10",
                    category === cat
                      ? "bg-primary text-white border-primary"
                      : "bg-card border-border"
                  )}
                >
                  {t(`categories.${cat}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="edate">{tCommon("date")}</Label>
            <Input id="edate" type="date" {...register("date")} className="mt-2" />
          </div>
          {farms.length > 0 && (
            <div>
              <Label>{tCommon("farm")}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setFarmId("")}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm border min-h-10",
                    !farmId ? "bg-primary text-white" : "bg-card border-border"
                  )}
                >
                  {tCommon("optional")}
                </button>
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
            <Label htmlFor="enote">{tCommon("note")}</Label>
            <Input id="enote" {...register("note")} className="mt-2" />
          </div>
          <div>
            <Label>{t("receiptPhoto")}</Label>
            <Input
              type="file"
              accept="image/*"
              className="mt-2"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
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
