import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plus } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

export function CreateProductDialog({ onProductCreated }: { onProductCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    sku: "",
    product_title: "",
    category: "",
    unit_cost: "",
    retail_price: "",
    initial_stock: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sku: formData.sku,
          product_title: formData.product_title,
          category: formData.category,
          unit_cost: parseFloat(formData.unit_cost),
          retail_price: parseFloat(formData.retail_price),
          initial_stock: parseInt(formData.initial_stock),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create product");
      }

      toast({
        title: "Success",
        description: `Product ${formData.sku} created successfully.`,
      });

      setOpen(false);
      setFormData({
        sku: "",
        product_title: "",
        category: "",
        unit_cost: "",
        retail_price: "",
        initial_stock: "",
      });
      
      if (onProductCreated) onProductCreated();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
          <Plus size={16} />
          Create New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Enter the details for the new SKU. Click save when you are done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU
              </Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="SS-PRO-BLK-M"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product_title" className="text-right">
                Title
              </Label>
              <Input
                id="product_title"
                name="product_title"
                value={formData.product_title}
                onChange={handleChange}
                placeholder="Performance Hoodie"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Apparel"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit_cost" className="text-right">
                Cost ($)
              </Label>
              <Input
                id="unit_cost"
                name="unit_cost"
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={handleChange}
                placeholder="15.50"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="retail_price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="retail_price"
                name="retail_price"
                type="number"
                step="0.01"
                value={formData.retail_price}
                onChange={handleChange}
                placeholder="45.00"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initial_stock" className="text-right">
                Stock Units
              </Label>
              <Input
                id="initial_stock"
                name="initial_stock"
                type="number"
                value={formData.initial_stock}
                onChange={handleChange}
                placeholder="100"
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
