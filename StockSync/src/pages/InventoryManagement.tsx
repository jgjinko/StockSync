import { useState } from "react";
import { Metrics } from "../components/chart-blocks";
import Container from "../components/container";
import { CreateProductDialog } from "../components/inventory/CreateProductDialog";
import { ManagementTable } from "../components/inventory/ManagementTable";

export default function InventoryManagement() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border p-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Inventory Management</h1>
        <CreateProductDialog onProductCreated={handleRefresh} />
      </div>
      
      <Container className="py-4 border-b border-border">
         <div className="flex h-full flex-col justify-center px-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Operational Overview</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage your unified inventory across Shopify, Amazon, and TikTok Shop. 
              This tab enables direct management of SKUs, including stock level overrides and catalog expansion.
            </p>
         </div>
      </Container>

      <Metrics key={`metrics-${refreshKey}`} />

      <div className="p-4">
         <ManagementTable refreshKey={refreshKey} />
      </div>
    </div>
  );
}
