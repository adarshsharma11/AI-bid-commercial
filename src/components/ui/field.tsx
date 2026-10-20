"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import type { ComponentProps } from "react";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function Label({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn("text-ink text-sm font-medium", className)}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-danger text-xs" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-muted text-xs">{hint}</p>
      ) : null}
    </div>
  );
}
