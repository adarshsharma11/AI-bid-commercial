import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-[color,background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-safe:active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
        secondary: "border border-line bg-surface text-ink hover:bg-surface-muted",
        outline: "border border-line bg-transparent text-ink hover:bg-surface-muted",
        ghost: "text-ink hover:bg-surface-muted",
        danger: "bg-danger text-white hover:bg-danger/90",
        link: "h-auto rounded-none px-0 text-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-2.5 text-xs",
        md: "h-9 px-3",
        lg: "h-10 px-4",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; pending?: boolean };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  pending = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classNames = cn(buttonVariants({ variant, size }), className);
  if (asChild) {
    return (
      <Slot className={classNames} {...props}>
        {children}
      </Slot>
    );
  }
  return (
    <button
      className={classNames}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...props}
    >
      {pending ? (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-pulse"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
}
