import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Trash2, Power, PowerOff, RefreshCw } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

export function ManagementTable({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/inventory");
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not connect to the backend API.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleDelete = async (sku: string) => {
    if (!confirm(`Are you sure you want to delete SKU: ${sku}?`)) return;

    try {
      const response = await fetch(`http://localhost:8000/api/inventory/${sku}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete SKU");

      toast({
        title: "Deleted",
        description: `SKU ${sku} removed successfully.`,
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleToggle = async (sku: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/inventory/${sku}/toggle`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to toggle status");

      toast({
        title: "Updated",
        description: `Status for ${sku} updated.`,
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2 text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Syncing inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">SKU</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                No products found. Start by creating one.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.sku} className={!item.is_active ? "opacity-50" : ""}>
                <TableCell className="font-mono text-xs font-bold">{item.sku}</TableCell>
                <TableCell className="max-w-[200px] truncate">{item.name}</TableCell>
                <TableCell>
                   <span className="text-xs text-slate-500">{item.category}</span>
                </TableCell>
                <TableCell>{item.available}</TableCell>
                <TableCell>
                  <Badge 
                    variant={item.status === "in_stock" ? "success" : item.status === "low_stock" ? "warning" : "destructive"}
                    className="capitalize"
                  >
                    {item.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                  ${typeof item.unit_cost === 'number' ? item.unit_cost.toFixed(2) : '0.00'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggle(item.sku)}
                    >
                      {item.is_active ? (
                        <Power className="h-4 w-4 text-green-600" />
                      ) : (
                        <PowerOff className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      onClick={() => handleDelete(item.sku)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
