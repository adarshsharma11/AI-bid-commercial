"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { QueryState } from "@/components/feedback/query-state";
import { PageContainer, PageHeader, SectionHeader } from "@/components/layout/page";
import { TabBar } from "@/components/navigation/tab-bar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { workspaceApi } from "@/lib/api";
import { ROLE_LABEL, TRADE_LABEL } from "@/lib/constants/labels";
import { queryKeys } from "@/lib/query/keys";
import {
  companySchema,
  locationSchema,
  teamMemberSchema,
  type CompanyFormValues,
  type LocationFormValues,
} from "@/types/schemas";
import {
  ROLES,
  TRADES,
  type GoNoGoCriterion,
  type NotificationPreferences,
  type ProposalTemplate,
  type Role,
  type Trade,
  type Workspace,
} from "@/types/domain";

const TABS = [
  { id: "company", label: "Company" },
  { id: "team", label: "Team & Roles" },
  { id: "trades", label: "Trades" },
  { id: "criteria", label: "Go/No-Go Criteria" },
  { id: "location", label: "Location & Travel" },
  { id: "proposal", label: "Proposal Templates" },
  { id: "notifications", label: "Notifications" },
  { id: "integrations", label: "Integrations" },
  { id: "usage", label: "AI & Usage" },
] as const;

type SettingsTab = (typeof TABS)[number]["id"];

const INTEGRATIONS = ["Email delivery", "BuildingConnected", "Procore", "Accounting"];

export function SettingsPage() {
  const refresh = useRefreshWorkspace();
  const [tab, setTab] = useState<SettingsTab>("company");
  const workspace = useQuery({
    queryKey: queryKeys.workspace.detail(),
    queryFn: ({ signal }) => workspaceApi.get(signal),
  });
  const users = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: ({ signal }) => workspaceApi.users(signal),
  });

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Workspace preferences for this demo. Nothing here bills a customer or connects a live integration."
      />
      <QueryState
        isPending={workspace.isPending}
        isFetching={workspace.isFetching && !workspace.isPending}
        isError={workspace.isError}
        error={workspace.error}
        onRetry={() => void workspace.refetch()}
        pendingLabel="Loading settings"
        skeleton={<SkeletonCard />}
      >
        {workspace.data ? (
          <div className="grid gap-5">
            <TabBar
              label="Settings"
              tabs={[...TABS]}
              activeId={tab}
              onSelect={(id) => setTab(id as SettingsTab)}
            />
            <div
              hidden={tab !== "company"}
              className={tab === "company" ? "settings-panel" : undefined}
              role="tabpanel"
              id="panel-company"
              aria-labelledby="tab-company"
            >
              <CompanyForm workspace={workspace.data} onSaved={refresh} />
            </div>
            <div
              hidden={tab !== "team"}
              className={tab === "team" ? "settings-panel" : undefined}
              role="tabpanel"
              id="panel-team"
              aria-labelledby="tab-team"
            >
              <section className="grid max-w-xl gap-3">
                <SectionHeader
                  title="Team"
                  description="Roles shown here are labels for the demo switcher, not accounts."
                />
                {users.isPending ? (
                  <SkeletonCard />
                ) : (
                  <ul className="divide-line border-line bg-surface divide-y border">
                    {users.data?.map((user) => (
                      <li
                        key={user.id}
                        className="flex justify-between px-3 py-2 text-sm"
                      >
                        <span>
                          {user.name}
                          <span className="text-muted block text-xs">{user.email}</span>
                        </span>
                        <span>{ROLE_LABEL[user.role]}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <AddMember onSaved={refresh} />
              </section>
            </div>
            <div
              hidden={tab !== "trades"}
              className={tab === "trades" ? "settings-panel" : undefined}
              role="tabpanel"
              id="panel-trades"
              aria-labelledby="tab-trades"
            >
              <Trades workspace={workspace.data} onSaved={refresh} />
            </div>
            <div
              hidden={tab !== "criteria"}
              className={tab === "criteria" ? "settings-panel" : undefined}
              role="tabpanel"
              id="panel-criteria"
              aria-labelledby="tab-criteria"
            >
              <Criteria
                key={JSON.stringify(workspace.data.goNoGoCriteria)}
                criteria={workspace.data.goNoGoCriteria}
                onSave={async (goNoGoCriteria) => {
                  await workspaceApi.update({ goNoGoCriteria });
                  toast.success("Criteria saved in this demo.");
                  await refresh();
                }}
              />
            </div>
            <div
              hidden={tab !== "location"}
              className={tab === "location" ? "settings-panel" : undefined}
              role="tabpanel"
              id="panel-location"
              aria-labelledby="tab-location"
            >
              <LocationForm workspace={workspace.data} onSaved={refresh} />
            </div>
            <div
              hidden={tab !== "proposal"}
              className={tab === "proposal" ? "settings-panel" : undefined}
              role="tabpanel"
              id="panel-proposal"
              aria-labelledby="tab-proposal"
            >
              <ProposalForm
                key={JSON.stringify(workspace.data.proposalTemplate)}
                template={workspace.data.proposalTemplate}
                onSaved={refresh}
              />
            </div>
            <div
              hidden={tab !== "notifications"}
              className={tab === "notifications" ? "settings-panel" : undefined}
              role="tabpanel"
              id="panel-notifications"
              aria-labelledby="tab-notifications"
            >
              <NotificationsForm
                key={JSON.stringify(workspace.data.notifications)}
                notes={workspace.data.notifications}
                onSaved={refresh}
              />
            </div>
            <div
              hidden={tab !== "integrations"}
              className={tab === "integrations" ? "settings-panel" : undefined}
              role="tabpanel"
              id="panel-integrations"
              aria-labelledby="tab-integrations"
            >
              <section className="grid max-w-xl gap-2">
                <SectionHeader
                  title="Integrations"
                  description="Placeholders only. These connections are not available in this demo."
                />
                <ul className="divide-line border-line bg-surface divide-y border">
                  {INTEGRATIONS.map((name) => (
                    <li
                      key={name}
                      className="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <span>{name}</span>
                      <Button size="sm" variant="outline" disabled>
                        Not connected
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <div
              hidden={tab !== "usage"}
              className={tab === "usage" ? "settings-panel" : undefined}
              role="tabpanel"
              id="panel-usage"
              aria-labelledby="tab-usage"
            >
              <section className="grid max-w-xl gap-2">
                <SectionHeader
                  title="AI usage and storage"
                  description="Sample counters, not metered usage."
                />
                <p className="text-sm">
                  Document storage used in this demo set: 186 MB of a 5 GB placeholder.
                </p>
                <p className="text-sm">
                  Assistant drafts this month: 42 sample actions. No model calls are made
                  from this frontend.
                </p>
              </section>
            </div>
          </div>
        ) : null}
      </QueryState>
    </PageContainer>
  );
}

function useWarnOnUnload(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);
}

function Unsaved({ dirty }: { dirty: boolean }) {
  if (!dirty) return null;
  return <p className="text-warning text-sm">Unsaved changes</p>;
}

function CompanyForm({
  workspace,
  onSaved,
}: {
  workspace: Workspace;
  onSaved: () => Promise<unknown>;
}) {
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: workspace.name,
      legalName: workspace.legalName,
      phone: workspace.phone,
      email: workspace.email,
    },
  });
  useWarnOnUnload(form.formState.isDirty);
  const save = useMutation({
    mutationFn: (values: CompanyFormValues) => workspaceApi.update(values),
    onSuccess: async (_data, values) => {
      form.reset(values);
      toast.success("Company profile saved in this demo.");
      await onSaved();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save."),
  });

  return (
    <form
      className="grid max-w-xl gap-3"
      onSubmit={form.handleSubmit((values) => save.mutate(values))}
    >
      <SectionHeader title="Company" />
      <Unsaved dirty={form.formState.isDirty} />
      <Field label="Name" htmlFor="ws-name" error={form.formState.errors.name?.message}>
        <Input id="ws-name" {...form.register("name")} />
      </Field>
      <Field
        label="Legal name"
        htmlFor="ws-legal"
        error={form.formState.errors.legalName?.message}
      >
        <Input id="ws-legal" {...form.register("legalName")} />
      </Field>
      <Field
        label="Phone"
        htmlFor="ws-phone"
        error={form.formState.errors.phone?.message}
      >
        <Input id="ws-phone" {...form.register("phone")} />
      </Field>
      <Field
        label="Email"
        htmlFor="ws-email"
        error={form.formState.errors.email?.message}
      >
        <Input id="ws-email" {...form.register("email")} />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" pending={save.isPending}>
          Save company
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!form.formState.isDirty || save.isPending}
          onClick={() => form.reset()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function LocationForm({
  workspace,
  onSaved,
}: {
  workspace: Workspace;
  onSaved: () => Promise<unknown>;
}) {
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      homeBase: workspace.homeBase,
      travelRadiusMiles: workspace.travelRadiusMiles,
    },
  });
  useWarnOnUnload(form.formState.isDirty);
  const save = useMutation({
    mutationFn: (values: LocationFormValues) => workspaceApi.update(values),
    onSuccess: async (_data, values) => {
      form.reset(values);
      toast.success("Location saved in this demo.");
      await onSaved();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save."),
  });

  return (
    <form
      className="grid max-w-xl gap-3"
      onSubmit={form.handleSubmit((values) => save.mutate(values))}
    >
      <SectionHeader
        title="Location and travel"
        description="Home base and radius feed the sample go/no-go score."
      />
      <Unsaved dirty={form.formState.isDirty} />
      <Field
        label="Home base"
        htmlFor="ws-home"
        error={form.formState.errors.homeBase?.message}
      >
        <Input id="ws-home" {...form.register("homeBase")} />
      </Field>
      <Field
        label="Travel radius (miles)"
        htmlFor="ws-radius"
        error={form.formState.errors.travelRadiusMiles?.message}
      >
        <Input
          id="ws-radius"
          type="number"
          {...form.register("travelRadiusMiles", { valueAsNumber: true })}
        />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" pending={save.isPending}>
          Save location
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!form.formState.isDirty || save.isPending}
          onClick={() => form.reset()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddMember({ onSaved }: { onSaved: () => Promise<unknown> }) {
  const form = useForm<{ name: string; email: string; role: Role; title: string }>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: { name: "", email: "", role: "precon_lead", title: "" },
  });
  const save = useMutation({
    mutationFn: (values: { name: string; email: string; role: Role; title: string }) =>
      workspaceApi.addUser(values),
    onSuccess: async () => {
      toast.success("Demo teammate added. This is not an account.");
      form.reset();
      await onSaved();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not add."),
  });
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={form.handleSubmit((values) => save.mutate(values))}
    >
      <Field
        label="Name"
        htmlFor="member-name"
        error={form.formState.errors.name?.message}
      >
        <Input id="member-name" {...form.register("name")} />
      </Field>
      <Field
        label="Email"
        htmlFor="member-email"
        error={form.formState.errors.email?.message}
      >
        <Input id="member-email" {...form.register("email")} />
      </Field>
      <Field
        label="Title"
        htmlFor="member-title"
        error={form.formState.errors.title?.message}
      >
        <Input id="member-title" {...form.register("title")} />
      </Field>
      <Field label="Role" htmlFor="member-role">
        <Select id="member-role" {...form.register("role")}>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABEL[role]}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" pending={save.isPending}>
        Add teammate
      </Button>
    </form>
  );
}

function Trades({
  workspace,
  onSaved,
}: {
  workspace: Workspace;
  onSaved: () => Promise<unknown>;
}) {
  const save = useMutation({
    mutationFn: (trades: Trade[]) => workspaceApi.update({ trades }),
    onSuccess: async () => {
      toast.success("Trades updated in this demo.");
      await onSaved();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not update trades."),
  });
  return (
    <section className="grid max-w-xl gap-2">
      <SectionHeader
        title="Trades"
        description="Painting is active. Other trades can be enabled without a frontend rewrite."
      />
      {TRADES.map((trade) => (
        <label key={trade} className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={workspace.trades.includes(trade)}
            disabled={save.isPending}
            onCheckedChange={(checked) => {
              const next = checked
                ? [...workspace.trades, trade]
                : workspace.trades.filter((item) => item !== trade);
              save.mutate(next);
            }}
          />
          {TRADE_LABEL[trade]}
        </label>
      ))}
    </section>
  );
}

function Criteria({
  criteria,
  onSave,
}: {
  criteria: GoNoGoCriterion[];
  onSave: (criteria: GoNoGoCriterion[]) => Promise<void>;
}) {
  const [rows, setRows] = useState(criteria);
  const [pending, setPending] = useState(false);
  const dirty = JSON.stringify(rows) !== JSON.stringify(criteria);
  useWarnOnUnload(dirty);
  return (
    <section className="grid max-w-xl gap-2">
      <SectionHeader
        title="Go/no-go criteria"
        description="Weights feed the sample score. The assistant still cannot decide."
      />
      <Unsaved dirty={dirty} />
      {rows.map((row, index) => (
        <label
          key={row.id}
          className="grid grid-cols-[minmax(0,1fr)_5rem] items-center gap-2 text-sm"
        >
          <span>{row.label}</span>
          <Input
            aria-label={`${row.label} weight`}
            type="number"
            value={row.weight}
            onChange={(event) => {
              const next = rows.map((item, itemIndex) =>
                itemIndex === index
                  ? { ...item, weight: Number(event.target.value) }
                  : item,
              );
              setRows(next);
            }}
          />
        </label>
      ))}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          pending={pending}
          onClick={() => {
            setPending(true);
            void onSave(rows).finally(() => setPending(false));
          }}
        >
          Save criteria
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!dirty || pending}
          onClick={() => setRows(criteria)}
        >
          Cancel
        </Button>
      </div>
    </section>
  );
}

function ProposalForm({
  template,
  onSaved,
}: {
  template: ProposalTemplate;
  onSaved: () => Promise<unknown>;
}) {
  const [draft, setDraft] = useState(template);
  const dirty = JSON.stringify(draft) !== JSON.stringify(template);
  useWarnOnUnload(dirty);
  const save = useMutation({
    mutationFn: () => workspaceApi.update({ proposalTemplate: draft }),
    onSuccess: async () => {
      toast.success("Proposal template saved in this demo.");
      await onSaved();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save."),
  });
  return (
    <section className="grid max-w-xl gap-3">
      <SectionHeader title="Proposal template" />
      <Unsaved dirty={dirty} />
      <Textarea
        aria-label="Default inclusions"
        value={draft.inclusions}
        onChange={(event) => setDraft({ ...draft, inclusions: event.target.value })}
      />
      <Textarea
        aria-label="Default exclusions"
        value={draft.exclusions}
        onChange={(event) => setDraft({ ...draft, exclusions: event.target.value })}
      />
      <Textarea
        aria-label="Default clarifications"
        value={draft.clarifications}
        onChange={(event) => setDraft({ ...draft, clarifications: event.target.value })}
      />
      <div className="flex gap-2">
        <Button type="button" pending={save.isPending} onClick={() => save.mutate()}>
          Save template
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!dirty || save.isPending}
          onClick={() => setDraft(template)}
        >
          Cancel
        </Button>
      </div>
    </section>
  );
}

function NotificationsForm({
  notes,
  onSaved,
}: {
  notes: NotificationPreferences;
  onSaved: () => Promise<unknown>;
}) {
  const [draft, setDraft] = useState(notes);
  const dirty = JSON.stringify(draft) !== JSON.stringify(notes);
  useWarnOnUnload(dirty);
  const save = useMutation({
    mutationFn: () => workspaceApi.update({ notifications: draft }),
    onSuccess: async () => {
      toast.success("Notifications saved in this demo.");
      await onSaved();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save."),
  });
  return (
    <section className="grid max-w-xl gap-3">
      <SectionHeader
        title="Notifications"
        description="These preferences stay in the demo workspace."
      />
      <Unsaved dirty={dirty} />
      {(["invitations", "addenda", "quotes", "rfis", "deadlines"] as const).map((key) => (
        <label key={key} className="flex items-center gap-2 text-sm capitalize">
          <Checkbox
            checked={draft[key]}
            onCheckedChange={(checked) => setDraft({ ...draft, [key]: checked === true })}
          />
          {key}
        </label>
      ))}
      <div className="flex gap-2">
        <Button type="button" pending={save.isPending} onClick={() => save.mutate()}>
          Save notifications
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!dirty || save.isPending}
          onClick={() => setDraft(notes)}
        >
          Cancel
        </Button>
      </div>
    </section>
  );
}
