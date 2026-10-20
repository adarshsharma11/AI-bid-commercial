"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, Menu, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useRole } from "@/hooks/use-role";
import { notificationsApi, projectsApi } from "@/lib/api";
import { ROLE_LABEL } from "@/lib/constants/labels";
import { queryKeys } from "@/lib/query/keys";
import { ROLES, type Role } from "@/types/domain";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const { role, setRole, user } = useRole();
  const [search, setSearch] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const results = useQuery({
    queryKey: queryKeys.projects.list({ search, page: 1, pageSize: 6 }),
    queryFn: ({ signal }) => projectsApi.list({ search, page: 1, pageSize: 6 }, signal),
    enabled: search.trim().length > 1,
  });
  const notifications = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ signal }) => notificationsApi.list(signal),
  });
  const unread = notifications.data?.filter((item) => !item.read).length ?? 0;

  return (
    <header className="border-line bg-canvas/95 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-3 backdrop-blur sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </Button>
      <div className="relative min-w-0 flex-1">
        <Search
          className="text-faint pointer-events-none absolute top-2.5 left-2.5 h-4 w-4"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search projects, cities, GCs"
          aria-label="Search projects"
          className="pl-8"
        />
        {search.trim().length > 1 ? (
          <div className="border-line bg-surface shadow-panel absolute top-11 right-0 left-0 z-40 border">
            {results.data?.items.length ? (
              <ul>
                {results.data.items.map((project) => (
                  <li key={project.id}>
                    <button
                      type="button"
                      className="hover:bg-surface-muted block w-full px-3 py-2 text-left text-sm"
                      onClick={() => {
                        setSearch("");
                        router.push(`/projects/${project.id}`);
                      }}
                    >
                      <span className="font-medium">{project.name}</span>
                      <span className="text-muted mt-0.5 block text-xs">
                        {project.gcName} · {project.city}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted px-3 py-3 text-sm">No matching projects.</p>
            )}
          </div>
        ) : null}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Notifications, ${unread} unread`}
          >
            <Bell className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {notifications.data?.slice(0, 5).map((item) => (
            <DropdownMenuItem key={item.id} asChild>
              <Link href={item.href}>{item.title}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)}>
        Help
      </Button>
      <label className="text-muted hidden items-center gap-2 text-xs md:flex">
        Demo role
        <select
          aria-label="Demo role"
          className="border-line bg-surface text-ink h-9 max-w-48 rounded-md border px-2 text-sm"
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
        >
          {ROLES.map((item) => (
            <option key={item} value={item}>
              {ROLE_LABEL[item]}
            </option>
          ))}
        </select>
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="max-w-48">
            <span className="truncate">{user.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.title}</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogTitle>How this demo works</DialogTitle>
          <DialogDescription>
            Northline is a frontend prototype for commercial bid management. Figures,
            drawings, and quantities are sample data. Switching roles does not sign anyone
            in. A future backend must enforce every permission.
          </DialogDescription>
          <ul className="mt-4 grid gap-2 text-sm">
            <li>
              The AI assistant can draft. It cannot approve, price, select a
              subcontractor, or submit.
            </li>
            <li>Takeoff approval belongs to the Precon / Design Lead.</li>
            <li>
              Go/no-go, subcontractor selection, bid price, and outcomes belong to the
              Construction Lead.
            </li>
            <li>Final proposal approval requires both human leads.</li>
          </ul>
        </DialogContent>
      </Dialog>
    </header>
  );
}
