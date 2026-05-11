import { CircleDollarSign } from "lucide-react";
import { inventoryValueByCategory } from "@/data/inventory-value-by-category";
import { addThousandsSeparator } from "@/lib/utils";
import ChartTitle from "../../components/chart-title";
import Chart from "./chart";

export default function InventoryValue() {
  return (
    <section className="flex h-full flex-col gap-2">
      <ChartTitle title="Inventory Value" icon={CircleDollarSign} />
      <Indicator />
      <div className="relative max-h-80 flex-grow">
        <Chart />
      </div>
    </section>
  );
}

function Indicator() {
  return (
    <div className="mt-3">
      <span className="text-xl text-muted-foreground mr-1">$</span>
      <span className="mr-1 text-2xl font-medium">
        {addThousandsSeparator(
          inventoryValueByCategory.reduce((acc, curr) => acc + curr.value, 0),
        )}
      </span>
      <span className="text-muted-foreground/60">Retail Value</span>
    </div>
  );
}
