"use client";

import { useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";

export function useRefreshWorkspace() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all() }),
      queryClient.invalidateQueries({ queryKey: ["scope"] }),
      queryClient.invalidateQueries({ queryKey: ["takeoffs"] }),
      queryClient.invalidateQueries({ queryKey: ["rfis"] }),
      queryClient.invalidateQueries({ queryKey: ["quotes"] }),
      queryClient.invalidateQueries({ queryKey: ["estimates"] }),
      queryClient.invalidateQueries({ queryKey: ["proposals"] }),
      queryClient.invalidateQueries({ queryKey: ["submissions"] }),
      queryClient.invalidateQueries({ queryKey: ["activity"] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() }),
      queryClient.invalidateQueries({ queryKey: ["reports"] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.detail() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.subcontractors.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.generalContractors.all() }),
    ]);
}
