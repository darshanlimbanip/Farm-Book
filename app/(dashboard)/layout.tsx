import { BottomNav } from "@/components/shared/BottomNav";
import { PinLockProvider } from "@/components/shared/PinLock";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PinLockProvider>
      <div className="min-h-screen bg-background pb-20">
        {children}
        <BottomNav />
      </div>
    </PinLockProvider>
  );
}
