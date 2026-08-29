"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFarm, updateFarm } from "@/lib/actions/farms";
import { enqueueOfflineAction } from "@/lib/offline/db";
import { useOfflineStore } from "@/lib/offline/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Farm } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1),
  location_text: z.string(),
  acres: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

interface FarmFormSheetProps {
  open: boolean;
  onClose: () => void;
  farm?: Farm | null;
  ownerId: string;
}

export function FarmFormSheet({
  open,
  onClose,
  farm,
  ownerId,
}: FarmFormSheetProps) {
  const t = useTranslations("farms");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { isOnline } = useOfflineStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: farm
      ? {
          name: farm.name,
          location_text: farm.location_text,
          acres: farm.acres,
        }
      : { name: "", location_text: "", acres: 0 },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    if (!isOnline) {
      await enqueueOfflineAction({
        id: crypto.randomUUID(),
        type: "farm",
        action: farm ? "update" : "create",
        payload: farm
          ? { id: farm.id, ...data }
          : { owner_id: ownerId, ...data },
      });
      setLoading(false);
      reset();
      onClose();
      router.refresh();
      return;
    }

    const result = farm
      ? await updateFarm(farm.id, data)
      : await createFarm(data);

    setLoading(false);
    if (!result.error) {
      reset();
      onClose();
      router.refresh();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{farm ? t("editFarm") : t("addFarm")}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">{t("nameLabel")}</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t("namePlaceholder")}
              className="mt-2"
            />
            {errors.name && (
              <p className="text-danger text-sm mt-1">{tCommon("required")}</p>
            )}
          </div>
          <div>
            <Label htmlFor="location">{t("locationLabel")}</Label>
            <Input
              id="location"
              {...register("location_text")}
              placeholder={t("locationPlaceholder")}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="acres">{t("acresLabel")}</Label>
            <Input
              id="acres"
              type="text"
              inputMode="decimal"
              {...register("acres")}
              className="mt-2"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
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
