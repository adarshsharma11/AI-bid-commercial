"use client";

import {
  BarChart3,
  Building2,
  CalendarDays,
  Columns3,
  Inbox,
  PanelLeft,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";

export const PRIMARY_NAV = [
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/pipeline", label: "Bid Pipeline", icon: Columns3 },
  { href: "/subcontractors", label: "Subcontractors", icon: Users },
  { href: "/general-contractors", label: "General Contractors", icon: Building2 },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function navIsActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  collapsed,
  onToggle,
  inboxCount,
}: {
  collapsed: boolean;
  onToggle: () => void;
  inboxCount: number;
}) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "border-line bg-surface sticky top-0 hidden h-screen shrink-0 flex-col border-r transition-[width] duration-200 lg:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "border-line flex h-14 items-center border-b",
          collapsed ? "justify-center" : "justify-between px-3",
        )}
      >
        {collapsed ? null : (
          <Link href="/today" className="min-w-0">
            <span className="block text-sm font-semibold tracking-tight">Northline</span>
            <span className="text-muted block truncate text-xs">Summit Coatings</span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="text-muted hover:bg-surface-muted hover:text-ink focus-visible:ring-accent rounded-md p-2 focus-visible:ring-2 focus-visible:outline-none"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>
      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 p-2">
        {PRIMARY_NAV.map((item) => {
          const active = navIsActive(pathname, item.href);
          const Icon = item.icon;
          const link = (
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-visible:ring-accent flex h-9 items-center gap-2 rounded-md px-2 text-sm focus-visible:ring-2 focus-visible:outline-none",
                active
                  ? "bg-accent-subtle text-accent font-medium"
                  : "text-ink hover:bg-surface-muted",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {collapsed ? null : <span className="truncate">{item.label}</span>}
              {!collapsed && item.href === "/inbox" && inboxCount > 0 ? (
                <span className="text-muted ml-auto text-xs tabular-nums">
                  {inboxCount}
                </span>
              ) : null}
            </Link>
          );
          return collapsed ? (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <div key={item.href}>{link}</div>
          );
        })}
      </nav>
      {collapsed ? null : (
        <p className="border-line text-muted border-t px-3 py-3 text-xs">
          Demo data. Actions update this browser session only.
        </p>
      )}
    </aside>
  );
}

export function MobileNav({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        side="right"
        className="left-0 max-w-xs border-r border-l-0 lg:hidden"
      >
        <div className="border-line border-b px-4 py-4">
          <DialogTitle>Northline</DialogTitle>
          <p className="text-muted text-xs">Summit Coatings</p>
        </div>
        <nav aria-label="Mobile" className="grid gap-1 p-2">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = navIsActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-md px-2 text-sm",
                  active ? "bg-accent-subtle text-accent" : "hover:bg-surface-muted",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
