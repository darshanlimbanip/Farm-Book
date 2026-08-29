"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TopBar } from "@/components/shared/TopBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { FarmFormSheet } from "@/components/farms/FarmFormSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteFarm } from "@/lib/actions/farms";
import { enqueueOfflineAction } from "@/lib/offline/db";
import { useOfflineStore } from "@/lib/offline/store";
import { Sprout, Pencil, Trash2, Plus } from "lucide-react";
import type { Farm } from "@/lib/types";

interface FarmsClientProps {
  farms: Farm[];
  ownerId: string;
}

export function FarmsClient({ farms, ownerId }: FarmsClientProps) {
  const t = useTranslations("farms");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { isOnline } = useOfflineStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!isOnline) {
      await enqueueOfflineAction({
        id: crypto.randomUUID(),
        type: "farm",
        action: "delete",
        payload: { id },
      });
    } else {
      await deleteFarm(id);
    }
    setDeleteId(null);
    router.refresh();
  };

  return (
    <>
      <TopBar
        title={t("title")}
        rightAction={
          <Button
            size="sm"
            onClick={() => {
              setEditingFarm(null);
              setSheetOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {t("addFarm")}
          </Button>
        }
      />

      <div className="px-4 py-4">
        {farms.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            action={
              <Button onClick={() => setSheetOpen(true)}>
                <Plus className="h-4 w-4" />
                {t("addFarm")}
              </Button>
            }
          />
        ) : (
          farms.map((farm) => (
            <Card key={farm.id} className="mb-3">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sprout className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground">{farm.name}</p>
                    <p className="text-sm text-muted">{farm.location_text}</p>
                    <p className="text-sm text-muted">
                      {farm.acres} {tCommon("acres")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingFarm(farm);
                        setSheetOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(farm.id)}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>
                {deleteId === farm.id && (
                  <div className="mt-3 p-3 bg-danger/5 rounded-lg border border-danger/20">
                    <p className="text-sm font-medium mb-2">
                      {t("deleteConfirm")}
                    </p>
                    <p className="text-xs text-muted mb-3">
                      {t("deleteWarning")}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteId(null)}
                      >
                        {tCommon("no")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(farm.id)}
                      >
                        {tCommon("yes")}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <FarmFormSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditingFarm(null);
        }}
        farm={editingFarm}
        ownerId={ownerId}
      />
    </>
  );
}
