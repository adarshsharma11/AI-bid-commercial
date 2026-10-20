"use client";

import { useQuery } from "@tanstack/react-query";
import { Suspense, useState, useSyncExternalStore, type ReactNode } from "react";

import { LoadingState } from "@/components/feedback/query-state";
import { MobileNav, Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { inboxApi } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

const SIDEBAR_KEY = "northline.sidebarCollapsed";
const sidebarListeners = new Set<() => void>();

function subscribeSidebar(listener: () => void) {
  sidebarListeners.add(listener);
  return () => sidebarListeners.delete(listener);
}

function readCollapsed() {
  return window.localStorage.getItem(SIDEBAR_KEY) === "true";
}

function writeCollapsed(collapsed: boolean) {
  window.localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  sidebarListeners.forEach((listener) => listener());
}

export function AppShell({ children }: { children: ReactNode }) {
  const collapsed = useSyncExternalStore(subscribeSidebar, readCollapsed, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const inbox = useQuery({
    queryKey: queryKeys.inbox.list("all"),
    queryFn: ({ signal }) => inboxApi.list("all", signal),
  });
  const inboxCount = inbox.data?.filter((item) => !item.read).length ?? 0;

  return (
    <div className="bg-canvas flex min-h-screen">
      <Suspense
        fallback={<div className="border-line hidden w-60 shrink-0 border-r md:block" />}
      >
        <Sidebar
          collapsed={collapsed}
          inboxCount={inboxCount}
          onToggle={() => writeCollapsed(!collapsed)}
        />
      </Suspense>
      <Suspense fallback={null}>
        <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="p-6">
                <LoadingState label="Loading page" />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
