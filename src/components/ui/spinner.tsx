import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // Ensure you have this utility function

interface SpinnerProps extends React.HTMLAttributes<SVGElement> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Loader2 className={cn("h-6 w-6 animate-spin", className)} {...props} />
  );
}
