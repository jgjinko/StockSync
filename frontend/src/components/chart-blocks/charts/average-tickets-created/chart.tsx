"use client";

import { useAtomValue } from "jotai";
import { VChart } from "@visactor/react-vchart";
import type { IBarChartSpec } from "@visactor/vchart";
import { stockChartDataAtom } from "@/lib/atoms";
import type { StockMetric } from "@/types/types";

const generateSpec = (data: StockMetric[]): IBarChartSpec => ({
  type: "bar",
  data: [
    {
      id: "barData",
      values: data,
    },
  ],
  xField: "category",
  yField: "count",
  seriesField: "type",
  padding: [10, 0, 10, 0],
  legends: {
    visible: false,
  },
  stack: false,
  tooltip: {
    trigger: ["click", "hover"],
  },
  bar: {
    state: {
      hover: {
        outerBorder: {
          distance: 2,
          lineWidth: 2,
        },
      },
    },
    style: {
      cornerRadius: [12, 12, 12, 12],
      zIndex: (datum) => {
        return datum.type === "reserved" ? 2 : 1;
      },
    },
  },
  color: ["#3161F8", "#60C2FB"],
});

export default function Chart() {
  const stockChartData = useAtomValue(stockChartDataAtom);
  const spec = generateSpec(stockChartData);
  return <VChart spec={spec} />;
}
