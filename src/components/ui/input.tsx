import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils/cn";

const control =
  "h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-faint focus-visible:ring-2 focus-visible:ring-accent disabled:bg-surface-muted disabled:opacity-70";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(control, "min-h-24 py-2 leading-5", className)} {...props} />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, "pr-8", className)} {...props} />;
}
