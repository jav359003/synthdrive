"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import DashboardProvider, { useDashboard } from "@/components/DashboardContext";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { selectedModel, setSelectedModel, refreshKey } = useDashboard();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        refreshKey={refreshKey}
      />
      <main className="ml-64 flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    // Check onboarding (skip if already on welcome page)
    if (pathname !== "/dashboard/welcome") {
      const seen = localStorage.getItem("synthdrive_onboarded");
      if (!seen) {
        router.replace("/dashboard/welcome");
        return;
      }
    }

    setReady(true);
  }, [user, loading, router, pathname]);

  if (loading || !user || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
