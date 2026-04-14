"use client";

import { VChart } from "@visactor/react-vchart";
import type { ICirclePackingChartSpec } from "@visactor/vchart";
import { inventoryValueByCategory } from "../../../../data/inventory-value-by-category";
import { addThousandsSeparator } from "../../../../lib/utils";

const spec: ICirclePackingChartSpec = {
  data: [
    {
      id: "data",
      values: inventoryValueByCategory,
    },
  ],
  type: "circlePacking",
  categoryField: "name",
  valueField: "value",
  drill: true,
  padding: 0,
  layoutPadding: 5,
  label: {
    style: {
      fill: "white",
      stroke: false,
      visible: (d) => d.depth === 0,
      text: (d) => `$${addThousandsSeparator(d.value)}`,
      fontSize: (d) => {
        const text = `$${addThousandsSeparator(d.value)}`;
        // Scale font size based on radius and text length to prevent overflow
        return Math.min(d.radius / 1.5, (d.radius * 2.8) / text.length);
      },
      dy: (d) => d.radius / 10,
    },
  },
  legends: [
    {
      visible: true,
      orient: "top",
      position: "start",
      padding: 0,
    },
  ],
  tooltip: {
    trigger: ["click", "hover"],
    mark: {
      content: {
        value: (d) => `$${addThousandsSeparator(d?.value)}`,
      },
    },
  },
  animationEnter: {
    easing: "cubicInOut",
  },
  animationExit: {
    easing: "cubicInOut",
  },
  animationUpdate: {
    easing: "cubicInOut",
  },
};

export default function Chart() {
  return <VChart spec={spec} />;
}
