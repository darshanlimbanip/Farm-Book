"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createWorker, updateWorker } from "@/lib/actions/workers";
import { enqueueOfflineAction } from "@/lib/offline/db";
import { useOfflineStore } from "@/lib/offline/store";
import { compressImage } from "@/lib/utils";
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
import type { Farm, Worker } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  daily_wage: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

interface WorkerFormSheetProps {
  open: boolean;
  onClose: () => void;
  worker?: Worker | null;
  farms: Farm[];
  assignedFarmIds?: string[];
  ownerId: string;
}

export function WorkerFormSheet({
  open,
  onClose,
  worker,
  farms,
  assignedFarmIds = [],
  ownerId,
}: WorkerFormSheetProps) {
  const t = useTranslations("workers");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { isOnline } = useOfflineStore();
  const [loading, setLoading] = useState(false);
  const [selectedFarms, setSelectedFarms] = useState<string[]>(assignedFarmIds);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: worker
      ? {
          name: worker.name,
          phone: worker.phone ?? "",
          daily_wage: worker.daily_wage,
        }
      : { name: "", phone: "", daily_wage: 0 },
  });

  const toggleFarm = (farmId: string) => {
    setSelectedFarms((prev) =>
      prev.includes(farmId)
        ? prev.filter((id) => id !== farmId)
        : [...prev, farmId]
    );
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    let photo_url = worker?.photo_url ?? undefined;

    if (photoFile) {
      const compressed = await compressImage(photoFile);
      photo_url = URL.createObjectURL(compressed);
    }

    const payload = {
      name: data.name,
      phone: data.phone,
      daily_wage: data.daily_wage,
      photo_url,
      farm_ids: selectedFarms,
    };

    if (!isOnline) {
      await enqueueOfflineAction({
        id: crypto.randomUUID(),
        type: "worker",
        action: worker ? "update" : "create",
        payload: worker
          ? { id: worker.id, ...payload, is_active: worker.is_active }
          : { owner_id: ownerId, ...payload },
      });
      setLoading(false);
      reset();
      onClose();
      router.refresh();
      return;
    }

    const result = worker
      ? await updateWorker(worker.id, {
          ...payload,
          is_active: worker.is_active,
        })
      : await createWorker(payload);

    setLoading(false);
    if (!result.error) {
      reset();
      setSelectedFarms([]);
      setPhotoFile(null);
      onClose();
      router.refresh();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {worker ? t("editWorker") : t("addWorker")}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="wname">{tCommon("name")}</Label>
            <Input id="wname" {...register("name")} className="mt-2" />
            {errors.name && (
              <p className="text-danger text-sm mt-1">{tCommon("required")}</p>
            )}
          </div>
          <div>
            <Label htmlFor="wphone">{tCommon("phone")}</Label>
            <Input
              id="wphone"
              type="tel"
              inputMode="numeric"
              {...register("phone")}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="wage">{t("dailyWage")}</Label>
            <Input
              id="wage"
              inputMode="numeric"
              {...register("daily_wage")}
              className="mt-2"
            />
          </div>
          <div>
            <Label>{t("assignFarms")}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {farms.map((farm) => (
                <button
                  key={farm.id}
                  type="button"
                  onClick={() => toggleFarm(farm.id)}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium border min-h-10",
                    selectedFarms.includes(farm.id)
                      ? "bg-primary text-white border-primary"
                      : "bg-card border-border text-foreground"
                  )}
                >
                  {farm.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="photo">{t("photoLabel")}</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              className="mt-2"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {tCommon("save")}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
