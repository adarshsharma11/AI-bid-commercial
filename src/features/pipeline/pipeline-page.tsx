"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { dataTableFeatures, DataTable } from "@/components/data-display/data-table";
import { DeadlineIndicator } from "@/components/data-display/indicators";
import { ProjectStatusBadge } from "@/components/data-display/status-badge";
import { EmptyState, QueryState } from "@/components/feedback/query-state";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { useRole } from "@/hooks/use-role";
import { projectsApi, workspaceApi } from "@/lib/api";
import { PROJECT_STATUS_LABEL, TRADE_LABEL } from "@/lib/constants/labels";
import { denialReason } from "@/lib/permissions/permissions";
import { queryKeys } from "@/lib/query/keys";
import { formatCurrency } from "@/lib/utils/currency";
import { newProjectSchema, type NewProjectFormValues } from "@/types/schemas";
import {
  PROJECT_STATUSES,
  TRADES,
  type DeadlineFilter,
  type ProjectListItem,
  type ProjectListQuery,
  type ProjectStatus,
  type Trade,
} from "@/types/domain";

const helper = createColumnHelper<typeof dataTableFeatures, ProjectListItem>();

const columns = [
  helper.accessor("name", {
    header: "Project",
    cell: (info) => (
      <Link
        href={`/projects/${info.row.original.id}`}
        className="font-medium hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  helper.accessor("gcName", { header: "General contractor" }),
  helper.accessor("trade", {
    header: "Trade",
    cell: (info) => TRADE_LABEL[info.getValue()],
  }),
  helper.accessor("bidDueAt", {
    header: "Bid deadline",
    cell: (info) => <DeadlineIndicator iso={info.getValue()} />,
  }),
  helper.accessor("estimatedValue", {
    header: "Estimated value",
    cell: (info) => formatCurrency(info.getValue()),
  }),
  helper.accessor("ownerName", { header: "Owner" }),
  helper.accessor("nextAction", { header: "Next action" }),
  helper.accessor("status", {
    header: "Status",
    cell: (info) => <ProjectStatusBadge status={info.getValue()} />,
  }),
];

const EMPTY_FILTERS: ProjectListQuery = {
  search: "",
  status: "all",
  trade: "all",
  ownerId: "all",
  gcId: "all",
  deadline: "all",
  page: 1,
  pageSize: 50,
};

export function PipelinePage() {
  const [filters, setFilters] = useState<ProjectListQuery>(EMPTY_FILTERS);
  const [view, setView] = useState<"list" | "board">("list");
  const [open, setOpen] = useState(false);
  const { role } = useRole();
  const refresh = useRefreshWorkspace();
  const reference = useQuery({
    queryKey: ["reference"],
    queryFn: ({ signal }) => workspaceApi.reference(signal),
  });
  const projects = useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: ({ signal }) => projectsApi.list(filters, signal),
    placeholderData: (previous) => previous,
  });

  const chips = filterChips(filters, setFilters);

  return (
    <PageContainer>
      <PageHeader
        title="Bid pipeline"
        description="Search, filter, and open commercial opportunities. Status changes go through the project workflow, not drag and drop."
        actions={
          <>
            <div className="border-line flex border">
              <Button
                variant={view === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
              >
                List
              </Button>
              <Button
                variant={view === "board" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setView("board")}
              >
                Board
              </Button>
            </div>
            <Button onClick={() => setOpen(true)}>New project</Button>
          </>
        }
      />
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Input
          aria-label="Search pipeline"
          placeholder="Search name, number, city, GC"
          value={filters.search ?? ""}
          onChange={(event) =>
            setFilters((current) => ({ ...current, search: event.target.value }))
          }
        />
        <FilterSelect
          label="Status"
          value={filters.status ?? "all"}
          onChange={(status) =>
            setFilters((current) => ({
              ...current,
              status: status as ProjectStatus | "all",
            }))
          }
          options={[
            ["all", "All statuses"],
            ...PROJECT_STATUSES.map(
              (status) => [status, PROJECT_STATUS_LABEL[status]] as const,
            ),
          ]}
        />
        <FilterSelect
          label="Trade"
          value={filters.trade ?? "all"}
          onChange={(trade) =>
            setFilters((current) => ({ ...current, trade: trade as Trade | "all" }))
          }
          options={[
            ["all", "All trades"],
            ...TRADES.map((trade) => [trade, TRADE_LABEL[trade]] as const),
          ]}
        />
        <FilterSelect
          label="Owner"
          value={filters.ownerId ?? "all"}
          onChange={(ownerId) => setFilters((current) => ({ ...current, ownerId }))}
          options={[
            ["all", "All owners"],
            ...(reference.data?.users.map((user) => [user.id, user.name] as const) ?? []),
          ]}
        />
        <FilterSelect
          label="General contractor"
          value={filters.gcId ?? "all"}
          onChange={(gcId) => setFilters((current) => ({ ...current, gcId }))}
          options={[
            ["all", "All GCs"],
            ...(reference.data?.generalContractors.map(
              (gc) => [gc.id, gc.name] as const,
            ) ?? []),
          ]}
        />
        <FilterSelect
          label="Deadline"
          value={filters.deadline ?? "all"}
          onChange={(deadline) =>
            setFilters((current) => ({
              ...current,
              deadline: deadline as DeadlineFilter,
            }))
          }
          options={[
            ["all", "Any deadline"],
            ["overdue", "Overdue"],
            ["today", "Due today"],
            ["soon", "Due within 3 days"],
            ["week", "Due this week"],
          ]}
        />
      </div>
      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="border-line bg-surface rounded-md border px-2 py-1 text-xs"
              onClick={chip.clear}
            >
              {chip.label} ×
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
            Reset filters
          </Button>
        </div>
      ) : null}
      <QueryState
        isPending={projects.isPending}
        isFetching={projects.isFetching}
        isError={projects.isError}
        error={projects.error}
        onRetry={() => void projects.refetch()}
        pendingLabel="Loading pipeline"
        skeleton={<SkeletonTable label="Loading pipeline" />}
        isEmpty={projects.data?.items.length === 0}
        emptyTitle="No projects match"
        emptyDescription="Reset the filters or add a project."
      >
        {projects.data && projects.data.items.length > 0 ? (
          view === "list" ? (
            <DataTable
              key={JSON.stringify(filters)}
              data={projects.data.items}
              columns={columns}
              caption="Bid pipeline"
            />
          ) : (
            <Board items={projects.data.items} />
          )
        ) : projects.data?.items.length === 0 ? (
          <EmptyState
            title="No projects match"
            description="Reset the filters to see the full demo pipeline."
            action={
              <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
                Reset filters
              </Button>
            }
          />
        ) : null}
      </QueryState>
      <NewProjectDialog
        open={open}
        onOpenChange={setOpen}
        disabledReason={denialReason(role, "review_documents")}
        contractors={reference.data?.generalContractors ?? []}
        owners={reference.data?.users ?? []}
        onCreated={async () => {
          setOpen(false);
          toast.success("Project added to this demo session.");
          await refresh();
        }}
      />
    </PageContainer>
  );
}

function filterChips(
  filters: ProjectListQuery,
  setFilters: (
    value: ProjectListQuery | ((current: ProjectListQuery) => ProjectListQuery),
  ) => void,
) {
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (filters.search) {
    chips.push({
      key: "search",
      label: `Search: ${filters.search}`,
      clear: () => setFilters((current) => ({ ...current, search: "" })),
    });
  }
  if (filters.status && filters.status !== "all") {
    chips.push({
      key: "status",
      label: PROJECT_STATUS_LABEL[filters.status],
      clear: () => setFilters((current) => ({ ...current, status: "all" })),
    });
  }
  if (filters.trade && filters.trade !== "all") {
    chips.push({
      key: "trade",
      label: TRADE_LABEL[filters.trade],
      clear: () => setFilters((current) => ({ ...current, trade: "all" })),
    });
  }
  if (filters.deadline && filters.deadline !== "all") {
    chips.push({
      key: "deadline",
      label: filters.deadline,
      clear: () => setFilters((current) => ({ ...current, deadline: "all" })),
    });
  }
  if (filters.ownerId && filters.ownerId !== "all") {
    chips.push({
      key: "owner",
      label: "Owner filter",
      clear: () => setFilters((current) => ({ ...current, ownerId: "all" })),
    });
  }
  if (filters.gcId && filters.gcId !== "all") {
    chips.push({
      key: "gc",
      label: "GC filter",
      clear: () => setFilters((current) => ({ ...current, gcId: "all" })),
    });
  }
  return chips;
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <Select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </Select>
  );
}

function Board({ items }: { items: ProjectListItem[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {PROJECT_STATUSES.map((status) => {
        const rows = items.filter((item) => item.status === status);
        return (
          <section
            key={status}
            className="w-72 shrink-0"
            aria-label={PROJECT_STATUS_LABEL[status]}
          >
            <header className="mb-2 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">{PROJECT_STATUS_LABEL[status]}</h2>
              <span className="text-muted text-xs tabular-nums">{rows.length}</span>
            </header>
            <ul className="grid gap-2">
              {rows.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className="border-line bg-surface hover:border-ink/30 block border px-3 py-2.5"
                  >
                    <span className="block text-sm font-medium">{project.name}</span>
                    <span className="text-muted mt-1 block text-xs">
                      {project.gcName}
                    </span>
                    <span className="mt-2 block text-xs">
                      {formatCurrency(project.estimatedValue)}
                    </span>
                    <span className="mt-2 block">
                      <DeadlineIndicator iso={project.bidDueAt} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function NewProjectDialog({
  open,
  onOpenChange,
  contractors,
  owners,
  onCreated,
  disabledReason,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractors: { id: string; name: string }[];
  owners: { id: string; name: string }[];
  onCreated: () => Promise<void>;
  disabledReason: string | null;
}) {
  const form = useForm<NewProjectFormValues>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: "",
      location: "",
      city: "Nashville",
      trade: "painting",
      gcId: "",
      bidDueAt: "",
      estimatedValue: null,
      ownerId: "usr_avery",
    },
  });
  const mutation = useMutation({
    mutationFn: (values: NewProjectFormValues) =>
      projectsApi.create(values, "precon_lead"),
    onSuccess: () => onCreated(),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not add the project."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>New project</DialogTitle>
        <DialogDescription>
          Adds a screening record in this browser session.
        </DialogDescription>
        <form
          className="mt-4 grid gap-3"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <Field
            label="Project name"
            htmlFor="project-name"
            error={form.formState.errors.name?.message}
          >
            <Input id="project-name" {...form.register("name")} />
          </Field>
          <Field
            label="Address"
            htmlFor="project-location"
            error={form.formState.errors.location?.message}
          >
            <Input id="project-location" {...form.register("location")} />
          </Field>
          <Field
            label="City"
            htmlFor="project-city"
            error={form.formState.errors.city?.message}
          >
            <Input id="project-city" {...form.register("city")} />
          </Field>
          <Field
            label="Trade"
            htmlFor="project-trade"
            error={form.formState.errors.trade?.message}
          >
            <Select id="project-trade" {...form.register("trade")}>
              {TRADES.map((trade) => (
                <option key={trade} value={trade}>
                  {TRADE_LABEL[trade]}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="General contractor"
            htmlFor="project-gc"
            error={form.formState.errors.gcId?.message}
          >
            <Select id="project-gc" {...form.register("gcId")}>
              <option value="">Choose</option>
              {contractors.map((contractor) => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Bid due"
            htmlFor="project-due"
            error={form.formState.errors.bidDueAt?.message}
          >
            <Input
              id="project-due"
              type="datetime-local"
              {...form.register("bidDueAt")}
            />
          </Field>
          <Field
            label="Estimated value"
            htmlFor="project-value"
            error={form.formState.errors.estimatedValue?.message}
            hint="Optional."
          >
            <Input
              id="project-value"
              type="number"
              min={0}
              {...form.register("estimatedValue", {
                setValueAs: (value) =>
                  value === "" || value == null ? null : Number(value),
              })}
            />
          </Field>
          <Field
            label="Owner"
            htmlFor="project-owner"
            error={form.formState.errors.ownerId?.message}
          >
            <Select id="project-owner" {...form.register("ownerId")}>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </Select>
          </Field>
          {disabledReason ? (
            <p className="text-danger text-sm">{disabledReason}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={Boolean(disabledReason) || mutation.isPending}
            >
              Add project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
