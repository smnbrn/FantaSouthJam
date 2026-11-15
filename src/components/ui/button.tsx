import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform,filter] duration-200 ease-out-expo active:scale-[0.97] disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
  {
    variants: {
      variant: {
        // Disattivato = grigio leggibile (non arancio spento); in caricamento resta arancio.
        default:
          "bg-primary text-primary-foreground shadow-glow hover:brightness-110 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none data-[loading=true]:disabled:bg-primary data-[loading=true]:disabled:text-primary-foreground data-[loading=true]:disabled:opacity-80",
        secondary: "bg-foreground text-background hover:bg-foreground/85 disabled:opacity-50",
        soft: "bg-primary/12 text-primary-ink hover:bg-primary/20 disabled:opacity-50",
        outline:
          "border border-border bg-transparent text-foreground hover:border-foreground/25 hover:bg-muted disabled:opacity-50",
        ghost: "bg-transparent text-foreground hover:bg-muted disabled:opacity-50",
        destructive: "bg-destructive text-destructive-foreground hover:brightness-110 disabled:opacity-50",
        link: "rounded-none px-0 text-primary-ink underline-offset-4 hover:underline active:scale-100 disabled:opacity-50",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-10 px-4 text-[13px]",
        lg: "h-13 px-8 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        data-loading={loading || undefined}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
