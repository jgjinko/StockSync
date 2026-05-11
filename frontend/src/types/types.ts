import type { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type StockMetric = {
  category: string;
  type: "available" | "reserved";
  count: number;
};
