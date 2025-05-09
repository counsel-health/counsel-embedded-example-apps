import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-gradient-to-r from-neutral-100 to-neutral-200 rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
