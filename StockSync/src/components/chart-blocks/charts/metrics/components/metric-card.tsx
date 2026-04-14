import { ArrowDownRight, ArrowUpRight, Check, TriangleAlert, CircleAlert } from "lucide-react";
import { chartTitle } from "../../../../primitives";
import { cn } from "../../../../../lib/utils";

export default function MetricCard({
  title,
  value,
  change,
  className,
}: {
  title: string;
  value: string;
  change: number;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-1 p-2", className)}>
      <h2 className={cn(chartTitle({ color: "mute", size: "md" }), "mb-1 font-semibold")}>
        {title}
      </h2>
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold">{value}</span>
        <Indicator title={title} change={change} />
      </div>
      <div className="text-sm text-muted-foreground mt-1">Inventory Status</div>
    </section>
  );
}

function Indicator({ title, change }: { title: string; change: number }) {
  if (title === "Total Tracked SKUs") {
    return (
      <span
        className={cn(
          "flex items-center text-lg font-medium",
          change > 0 ? "text-green-500" : "text-red-500"
        )}
      >
        {change > 0 ? "+" : ""}
        {Math.round(change * 100)}%
        {change > 0 ? (
          <ArrowUpRight className="ml-1 inline-block h-5 w-5" />
        ) : (
          <ArrowDownRight className="ml-1 inline-block h-5 w-5" />
        )}
      </span>
    );
  }

  if (title === "In Stock (Healthy)") {
    return (
      <span className="flex items-center text-green-500">
        <Check className="h-6 w-6" />
      </span>
    );
  }

  if (title === "Low Stock (Warning)") {
    return (
      <span className="flex items-center text-yellow-500">
        <TriangleAlert className="h-6 w-6" />
      </span>
    );
  }

  if (title === "Out of Stock (Critical)") {
    return (
      <span className="flex items-center text-red-500">
        <CircleAlert className="h-6 w-6" />
      </span>
    );
  }

  return null;
}
