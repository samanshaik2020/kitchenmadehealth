import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-terracotta px-5 py-3 text-white shadow-[0_8px_24px_rgba(179,87,55,.2)] hover:-translate-y-0.5 hover:bg-terracotta-dark",
        secondary: "bg-ink px-5 py-3 text-white hover:-translate-y-0.5 hover:bg-black",
        outline:
          "border border-line bg-white px-5 py-3 text-ink hover:border-ink hover:bg-cream",
        ghost: "px-3 py-2 text-ink hover:bg-clay/40",
        destructive: "bg-red-700 px-5 py-3 text-white hover:bg-red-800",
      },
      size: {
        default: "min-h-11",
        sm: "min-h-9 px-4 py-2 text-xs",
        lg: "min-h-13 px-7 py-3.5",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
