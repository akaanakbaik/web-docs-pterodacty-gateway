import { cn } from "../../lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ui-skeleton", className)} {...props} />;
}

export { Skeleton };
