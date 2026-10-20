"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/hooks/use-role";
import { getQueryClient } from "@/lib/query/client";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <RoleProvider>
        <TooltipProvider>
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </RoleProvider>
    </QueryClientProvider>
  );
}
