"use client";

import { useAtomValue } from "jotai";
import { PackageSearch } from "lucide-react";
import { stockChartDataAtom } from "@/lib/atoms";
import type { StockMetric } from "@/types/types";
import ChartTitle from "../../components/chart-title";
import Chart from "./chart";
import MetricCard from "./components/metric-card";

const calMetricCardValue = (
  data: StockMetric[],
  type: "available" | "reserved",
) => {
  const filteredData = data.filter((item) => item.type === type);
  return Math.round(
    filteredData.reduce((acc, curr) => acc + curr.count, 0) /
      filteredData.length,
  );
};

export default function StockByCategory() {
  const stockChartData = useAtomValue(stockChartDataAtom);
  const avgAvailable = calMetricCardValue(stockChartData, "available");
  const avgReserved = calMetricCardValue(stockChartData, "reserved");

  return (
    <section className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <ChartTitle title="Stock Levels by Category" icon={PackageSearch} />
      </div>
      <div className="flex flex-wrap">
        <div className="my-4 flex w-52 shrink-0 flex-col justify-center gap-6">
          <MetricCard
            title="Avg. Available Stock"
            value={avgAvailable}
            color="#3161F8"
          />
          <MetricCard
            title="Avg. Reserved Stock"
            value={avgReserved}
            color="#60C2FB"
          />
        </div>
        <div className="relative h-96 min-w-[320px] flex-1">
          <Chart />
        </div>
      </div>
    </section>
  );
}
