import {
  StockByCategory,
  InventoryValue,
  StockHealth,
  Metrics,
  InventoryByChannel,
} from "@/components/chart-blocks";
import Container from "@/components/container";

export default function Home() {
  return (
    <div>
      <Metrics />
      <div className="grid grid-cols-1 divide-y border-b border-border laptop:grid-cols-3 laptop:divide-x laptop:divide-y-0 laptop:divide-border">
        <Container className="py-4 laptop:col-span-2">
          <StockByCategory />
        </Container>
        <Container className="py-4 laptop:col-span-1">
          <InventoryValue />
        </Container>
      </div>
      <div className="grid grid-cols-1 divide-y border-b border-border laptop:grid-cols-2 laptop:divide-x laptop:divide-y-0 laptop:divide-border">
        <Container className="py-4 laptop:col-span-1">
          <InventoryByChannel />
        </Container>
        <Container className="py-4 laptop:col-span-1">
          <StockHealth />
        </Container>
      </div>
    </div>
  );
}
