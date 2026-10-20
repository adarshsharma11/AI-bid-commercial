"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

import { ROLE_LABEL } from "@/lib/constants/labels";
import type { Role } from "@/types/domain";

const STORAGE_KEY = "northline.demoRole";

export const DEMO_USERS: Record<Role, { id: string; name: string; title: string }> = {
  precon_lead: { id: "usr_avery", name: "Avery Lang", title: ROLE_LABEL.precon_lead },
  construction_lead: {
    id: "usr_marcus",
    name: "Marcus Hale",
    title: ROLE_LABEL.construction_lead,
  },
  ai_assistant: {
    id: "usr_ai",
    name: "Northline Assistant",
    title: ROLE_LABEL.ai_assistant,
  },
};

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readRole(): Role {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "precon_lead" ||
    stored === "construction_lead" ||
    stored === "ai_assistant"
    ? stored
    : "precon_lead";
}

function writeRole(role: Role) {
  window.localStorage.setItem(STORAGE_KEY, role);
  listeners.forEach((listener) => listener());
}

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  user: (typeof DEMO_USERS)[Role];
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const role = useSyncExternalStore(subscribe, readRole, () => "precon_lead" as const);
  return (
    <RoleContext.Provider value={{ role, setRole: writeRole, user: DEMO_USERS[role] }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const value = useContext(RoleContext);
  if (!value) throw new Error("useRole must be used inside RoleProvider.");
  return value;
}
