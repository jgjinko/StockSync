"use client";

import { useState } from "react";
import { ShieldCheck, ArrowDownToLine, AlertTriangle } from "lucide-react";
import { stockHealth, totalSKUs } from "@/data/stock-health";
import { inventory, InventoryItem } from "@/data/inventory";
import ChartTitle from "../../components/chart-title";
import LinearProgress from "./components/linear-progress";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const stockHealthOptions = [
  {
    label: "In Stock",
    color: "#5fb67a",
    percentage: stockHealth.inStock,
    icon: <ShieldCheck className="h-6 w-6" stroke="#5fb67a" />,
  },
  {
    label: "Low Stock",
    color: "#f5c36e",
    percentage: stockHealth.lowStock,
    icon: <ArrowDownToLine className="h-6 w-6" stroke="#f5c36e" />,
  },
  {
    label: "Out of Stock",
    color: "#da6d67",
    percentage: stockHealth.outOfStock,
    icon: <AlertTriangle className="h-6 w-6" stroke="#da6d67" />,
  },
];

function StockDetailsDialog({
  open,
  onOpenChange,
  title,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: InventoryItem[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title} Products</DialogTitle>
          <DialogDescription>Viewing {data.length} items.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.productTitle}</TableCell>
                  <TableCell>{item.productCategory}</TableCell>
                  <TableCell>{item.available}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === "outOfStock" ? "destructive" : "secondary"}
                    >
                      {item.status === "outOfStock" ? "Out of Stock" : "Low Stock"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default function StockHealth() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"lowStock" | "outOfStock" | null>(null);

  const lowStockItems = inventory.filter((i) => i.status === "lowStock");
  const outOfStockItems = inventory.filter((i) => i.status === "outOfStock");

  const handleCardClick = (label: string) => {
    if (label === "Low Stock") {
      setSelectedStatus("lowStock");
      setDialogOpen(true);
    } else if (label === "Out of Stock") {
      setSelectedStatus("outOfStock");
      setDialogOpen(true);
    }
  };

  const getDialogData = () => {
    if (selectedStatus === "lowStock") return { title: "Low Stock", data: lowStockItems };
    if (selectedStatus === "outOfStock") return { title: "Out of Stock", data: outOfStockItems };
    return { title: "", data: [] };
  };

  const dialogData = getDialogData();

  return (
    <section className="flex h-full flex-col gap-2">
      <ChartTitle title="Stock Health Overview" icon={ShieldCheck} />
      <div className="my-4 flex h-full items-center justify-between">
        <div className="mx-auto grid w-full grid-cols-2 gap-6">
          <TotalSKUs />
          {stockHealthOptions.map((option) => (
            <div
              key={option.label}
              onClick={() => handleCardClick(option.label)}
              className={option.label !== "In Stock" ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
            >
              <LinearProgress
                label={option.label}
                color={option.color}
                percentage={option.percentage}
                icon={option.icon}
              />
            </div>
          ))}
        </div>
      </div>
      <StockDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogData.title}
        data={dialogData.data}
      />
    </section>
  );
}

function TotalSKUs() {
  return (
    <div className="flex flex-col items-start justify-center">
      <div className="text-xs text-muted-foreground">Total Managed</div>
      <div className="text-2xl font-medium">{totalSKUs} SKUs</div>
    </div>
  );
}
