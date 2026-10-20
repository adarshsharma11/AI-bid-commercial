"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({ ...props }: ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root delayDuration={250} {...props} />;
}

export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={6}
        className={cn("bg-ink z-50 rounded-md px-2 py-1 text-xs text-white", className)}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
