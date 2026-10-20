"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { dataTableFeatures, DataTable } from "@/components/data-display/data-table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { QueryState } from "@/components/feedback/query-state";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useRefreshWorkspace } from "@/hooks/use-refresh-workspace";
import { generalContractorsApi, subcontractorsApi } from "@/lib/api";
import { TRADE_LABEL } from "@/lib/constants/labels";
import { queryKeys } from "@/lib/query/keys";
import { formatDate } from "@/lib/utils/dates";
import { directorySchema, type DirectoryFormValues } from "@/types/schemas";
import {
  TRADES,
  type GeneralContractor,
  type Subcontractor,
  type Trade,
} from "@/types/domain";

type Row = {
  id: string;
  name: string;
  city: string;
  tradeOrCategory: string;
  primaryContact: string;
  phone: string;
  email: string;
  insurance: string;
  paymentHistory: string;
  source: Subcontractor | GeneralContractor;
};

const helper = createColumnHelper<typeof dataTableFeatures, Row>();

export function DirectoryPage({
  kind,
}: {
  kind: "subcontractors" | "general-contractors";
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const isSub = kind === "subcontractors";
  const subs = useQuery({
    queryKey: queryKeys.subcontractors.list(search),
    queryFn: ({ signal }) => subcontractorsApi.list(search, signal),
    enabled: isSub,
    placeholderData: (previous) => previous,
  });
  const contractors = useQuery({
    queryKey: queryKeys.generalContractors.list(search),
    queryFn: ({ signal }) => generalContractorsApi.list(search, signal),
    enabled: !isSub,
    placeholderData: (previous) => previous,
  });
  const query = isSub ? subs : contractors;
  const rows: Row[] = (query.data ?? []).map((item) => {
    if ("trade" in item) {
      return {
        id: item.id,
        name: item.name,
        city: item.city,
        tradeOrCategory: TRADE_LABEL[item.trade],
        primaryContact: item.primaryContact,
        phone: item.phone,
        email: item.email,
        insurance: item.insuranceOnFile
          ? `On file · ${formatDate(item.insuranceExpiresOn)}`
          : "Missing",
        paymentHistory: item.paymentHistory,
        source: item,
      };
    }
    return {
      id: item.id,
      name: item.name,
      city: item.city,
      tradeOrCategory: item.category,
      primaryContact: item.primaryContact,
      phone: item.phone,
      email: item.email,
      insurance: item.insuranceOnFile
        ? `On file · ${formatDate(item.insuranceExpiresOn)}`
        : "Missing",
      paymentHistory: item.paymentHistory,
      source: item,
    };
  });
  const columns = [
    helper.accessor("name", {
      header: "Company",
      cell: (info) => (
        <button
          type="button"
          className="font-medium hover:underline"
          onClick={() => setSelected(info.row.original)}
        >
          {info.getValue()}
        </button>
      ),
    }),
    helper.accessor("tradeOrCategory", { header: isSub ? "Trade" : "Category" }),
    helper.accessor("city", { header: "City" }),
    helper.accessor("primaryContact", { header: "Contact" }),
    helper.accessor("phone", { header: "Phone" }),
    helper.accessor("insurance", { header: "Insurance" }),
    helper.accessor("paymentHistory", { header: "Payment" }),
  ];

  return (
    <PageContainer>
      <PageHeader
        title={isSub ? "Subcontractors" : "General contractors"}
        description="Directory records are demonstration contacts. Phone numbers use the 555 exchange."
        actions={<Button onClick={() => setCreating(true)}>Add company</Button>}
      />
      <Input
        aria-label="Search directory"
        placeholder="Search company, city, or contact"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-md"
      />
      <QueryState
        isPending={query.isPending}
        isFetching={query.isFetching}
        pendingLabel="Loading directory"
        skeleton={<SkeletonTable label="Loading directory" />}
        isError={query.isError}
        error={query.error}
        onRetry={() => void query.refetch()}
        isEmpty={rows.length === 0}
        emptyTitle="No companies"
        emptyDescription="Try a different search."
      >
        <DataTable
          key={search}
          data={rows}
          columns={columns}
          caption={isSub ? "Subcontractors" : "General contractors"}
        />
      </QueryState>
      <CompanyDrawer row={selected} onClose={() => setSelected(null)} kind={kind} />
      <CompanyForm open={creating} kind={kind} onClose={() => setCreating(false)} />
    </PageContainer>
  );
}

function CompanyDrawer({
  row,
  onClose,
  kind,
}: {
  row: Row | null;
  onClose: () => void;
  kind: "subcontractors" | "general-contractors";
}) {
  const projects = useQuery({
    queryKey: ["directory-projects", kind, row?.id],
    queryFn: ({ signal }) =>
      kind === "subcontractors"
        ? subcontractorsApi.projects(row!.id, signal)
        : generalContractorsApi.projects(row!.id, signal),
    enabled: Boolean(row),
  });
  const source = row?.source;

  return (
    <Dialog open={Boolean(row)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent side="right" className="overflow-y-auto p-5">
        {row && source ? (
          <div className="grid gap-3 pr-6">
            <DialogTitle>{row.name}</DialogTitle>
            <p className="text-sm">{row.primaryContact}</p>
            <p className="text-muted text-sm">{row.email}</p>
            <p className="text-muted text-sm">{row.phone}</p>
            <p className="text-sm">{source.notes}</p>
            <p className="text-sm">
              Win rate:{" "}
              {source.winRate == null
                ? "Unknown"
                : `${Math.round(source.winRate * 100)}%`}
            </p>
            <h3 className="text-sm font-semibold">Projects</h3>
            <ul className="grid gap-1 text-sm">
              {projects.data?.map((project) => (
                <li key={project.id}>
                  <Link href={`/projects/${project.id}`} className="hover:underline">
                    {project.name}
                  </Link>
                </li>
              ))}
              {projects.data?.length === 0 ? (
                <li className="text-muted">No linked projects.</li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CompanyForm({
  open,
  onClose,
  kind,
}: {
  open: boolean;
  onClose: () => void;
  kind: "subcontractors" | "general-contractors";
}) {
  const refresh = useRefreshWorkspace();
  const [trade, setTrade] = useState<Trade>("painting");
  const form = useForm<DirectoryFormValues>({
    resolver: zodResolver(directorySchema),
    defaultValues: {
      name: "",
      city: "Nashville",
      phone: "",
      email: "",
      primaryContact: "",
      notes: "",
    },
  });
  const save = useMutation({
    mutationFn: async (values: DirectoryFormValues) => {
      if (kind === "subcontractors") return subcontractorsApi.save({ ...values, trade });
      return generalContractorsApi.save(values);
    },
    onSuccess: async () => {
      toast.success("Company saved in this demo.");
      await refresh();
      onClose();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save."),
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogTitle>Add company</DialogTitle>
        <form
          className="mt-4 grid gap-3"
          onSubmit={form.handleSubmit((values) => save.mutate(values))}
        >
          <Field
            label="Name"
            htmlFor="company-name"
            error={form.formState.errors.name?.message}
          >
            <Input id="company-name" {...form.register("name")} />
          </Field>
          <Field
            label="City"
            htmlFor="company-city"
            error={form.formState.errors.city?.message}
          >
            <Input id="company-city" {...form.register("city")} />
          </Field>
          <Field
            label="Phone"
            htmlFor="company-phone"
            error={form.formState.errors.phone?.message}
          >
            <Input id="company-phone" {...form.register("phone")} />
          </Field>
          <Field
            label="Email"
            htmlFor="company-email"
            error={form.formState.errors.email?.message}
          >
            <Input id="company-email" {...form.register("email")} />
          </Field>
          <Field
            label="Primary contact"
            htmlFor="company-contact"
            error={form.formState.errors.primaryContact?.message}
          >
            <Input id="company-contact" {...form.register("primaryContact")} />
          </Field>
          {kind === "subcontractors" ? (
            <Field label="Trade" htmlFor="company-trade">
              <Select
                id="company-trade"
                value={trade}
                onChange={(event) => setTrade(event.target.value as Trade)}
              >
                {TRADES.map((trade) => (
                  <option key={trade} value={trade}>
                    {TRADE_LABEL[trade]}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field
            label="Notes"
            htmlFor="company-notes"
            error={form.formState.errors.notes?.message}
          >
            <Textarea id="company-notes" {...form.register("notes")} />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" disabled={save.isPending}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
