"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  side = "center",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { side?: "center" | "right" }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="bg-ink/30 fixed inset-0 z-40" />
      <DialogPrimitive.Content
        className={cn(
          "bg-surface text-ink shadow-panel z-50 focus:outline-none",
          side === "center" &&
            "border-line fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border p-5",
          side === "right" &&
            "border-line fixed inset-y-0 right-0 flex w-full max-w-xl flex-col border-l",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="text-muted hover:bg-surface-muted hover:text-ink focus-visible:ring-accent absolute top-3 right-3 rounded-md p-1 focus-visible:ring-2 focus-visible:outline-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-muted mt-1 text-sm", className)}
      {...props}
    />
  );
}
