import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-kiosk-base font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "gradient-primary text-primary-foreground shadow-button hover:brightness-110",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Kiosk-specific variants
        kiosk: "gradient-primary text-primary-foreground shadow-button hover:brightness-110 touch-target text-kiosk-lg font-bold",
        "kiosk-secondary": "bg-secondary text-secondary-foreground hover:bg-secondary/80 touch-target text-kiosk-lg font-semibold border border-border",
        "kiosk-success": "bg-success text-success-foreground kiosk-glow-success hover:brightness-110 touch-target text-kiosk-lg font-bold",
        "kiosk-ghost": "bg-transparent text-foreground hover:bg-secondary touch-target",
        "kiosk-category": "bg-card text-card-foreground border border-border hover:border-primary hover:bg-secondary shadow-card touch-target flex-col gap-3 py-6",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-md px-4",
        lg: "h-14 rounded-xl px-8",
        xl: "h-16 rounded-xl px-10 text-kiosk-lg",
        icon: "h-12 w-12",
        // Kiosk sizes
        kiosk: "h-16 px-8 rounded-xl",
        "kiosk-lg": "h-20 px-10 rounded-2xl text-kiosk-xl",
        "kiosk-icon": "h-16 w-16 rounded-xl",
        "kiosk-icon-lg": "h-20 w-20 rounded-2xl",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
