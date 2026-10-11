"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

/** Toaster in stile "cartellino da tabellone", riutilizza i token del tema. */
function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl! border! border-border! bg-surface! text-foreground! shadow-lg! font-sans!",
          title: "font-semibold!",
          description: "text-muted-foreground!",
          actionButton: "bg-primary! text-primary-foreground!",
          cancelButton: "bg-muted! text-muted-foreground!",
          success: "border-success!",
          error: "border-destructive!",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
