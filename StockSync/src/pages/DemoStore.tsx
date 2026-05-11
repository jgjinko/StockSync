import { useState, useMemo } from "react";
import { ShoppingBag, Minus, Plus, Loader2, SlidersHorizontal, Tag } from "lucide-react";
import { inventory, InventoryItem } from "../data/inventory";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { AspectRatio } from "../components/ui/aspect-ratio";
import { useToast } from "../hooks/use-toast";

// ── Local state shape ────────────────────────────────────────────────────────
interface LocalItem extends InventoryItem {
  localAvailable: number;
  localStatus: InventoryItem["status"];
}

function computeStatus(available: number, safetyThreshold: number): InventoryItem["status"] {
  if (available === 0) return "outOfStock";
  if (available <= safetyThreshold) return "lowStock";
  return "inStock";
}

// ── Category palette ─────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  electronics:  "from-blue-950/60 to-blue-900/40",
  apparel:      "from-violet-950/60 to-violet-900/40",
  accessories:  "from-amber-950/60 to-amber-900/40",
  home:         "from-emerald-950/60 to-emerald-900/40",
  health:       "from-rose-950/60 to-rose-900/40",
  sports:       "from-orange-950/60 to-orange-900/40",
};
const DEFAULT_GRADIENT = "from-zinc-900/60 to-zinc-800/40";

function categoryGradient(cat: string) {
  return CATEGORY_COLORS[cat.toLowerCase()] ?? DEFAULT_GRADIENT;
}

// ── Status badge helper ───────────────────────────────────────────────────────
function StockBadge({ status, available }: { status: InventoryItem["status"]; available: number }) {
  if (status === "outOfStock")
    return <Badge variant="destructive" className="text-[10px] font-bold tracking-wide">Out of Stock</Badge>;
  if (status === "lowStock")
    return (
      <Badge variant="outline" className="text-[10px] font-bold tracking-wide border-amber-400 text-amber-400">
        Low Stock · {available} left
      </Badge>
    );
  return (
    <Badge className="text-[10px] font-bold tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30">
      In Stock · {available}
    </Badge>
  );
}

// ── Sort options ─────────────────────────────────────────────────────────────
type SortKey = "priceAsc" | "priceDesc" | "stockAsc" | "stockDesc" | "default";
const SORT_LABELS: Record<SortKey, string> = {
  default:   "Default",
  priceAsc:  "Price: Low → High",
  priceDesc: "Price: High → Low",
  stockAsc:  "Stock: Low → High",
  stockDesc: "Stock: High → Low",
};

export default function DemoStore() {
  // Seed local state from inventory.ts — always available, no backend required
  const [items, setItems] = useState<LocalItem[]>(() =>
    inventory.map((item) => ({
      ...item,
      localAvailable: item.available,
      localStatus: item.status,
    }))
  );

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [buying, setBuying] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const { toast } = useToast();

  // Unique categories for filter bar
  const categories = useMemo(() => {
    const cats = Array.from(new Set(inventory.map((i) => i.productCategory))).sort();
    return ["all", ...cats];
  }, []);

  // Filtered + sorted items
  const displayItems = useMemo(() => {
    let filtered = activeCategory === "all"
      ? items
      : items.filter((i) => i.productCategory === activeCategory);

    switch (sortKey) {
      case "priceAsc":   filtered = [...filtered].sort((a, b) => a.retailPrice - b.retailPrice); break;
      case "priceDesc":  filtered = [...filtered].sort((a, b) => b.retailPrice - a.retailPrice); break;
      case "stockAsc":   filtered = [...filtered].sort((a, b) => a.localAvailable - b.localAvailable); break;
      case "stockDesc":  filtered = [...filtered].sort((a, b) => b.localAvailable - a.localAvailable); break;
    }
    return filtered;
  }, [items, activeCategory, sortKey]);

  function getQty(sku: string) {
    return quantities[sku] ?? 1;
  }

  function changeQty(sku: string, delta: number, maxAvail: number) {
    setQuantities((prev) => ({
      ...prev,
      [sku]: Math.min(maxAvail, Math.max(1, (prev[sku] ?? 1) + delta)),
    }));
  }

  async function handleBuy(item: LocalItem) {
    const qty = getQty(item.sku);
    setBuying(item.sku);

    // ── Optimistic update ──────────────────────────────────────────────────
    const prevItems = items;
    setItems((prev) =>
      prev.map((i) => {
        if (i.sku !== item.sku) return i;
        const newAvail = Math.max(0, i.localAvailable - qty);
        return {
          ...i,
          localAvailable: newAvail,
          localStatus: computeStatus(newAvail, i.safetyThreshold),
        };
      })
    );

    try {
      const res = await fetch("http://localhost:8000/api/simulate-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: item.sku, quantity: qty }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Purchase failed");
      }

      toast({
        title: "✅ Order Placed!",
        description: `${qty} unit(s) of "${item.productTitle}" confirmed.`,
      });

      // Reset quantity stepper for this card
      setQuantities((prev) => ({ ...prev, [item.sku]: 1 }));
    } catch (err: any) {
      // ── Rollback ────────────────────────────────────────────────────────
      setItems(prevItems);
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: err.message?.includes("fetch")
          ? "Could not reach the backend. Check if the server is running."
          : err.message,
      });
    } finally {
      setBuying(null);
    }
  }

  return (
    <div className="min-h-full bg-background">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/15 p-2.5 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none">StockSync Sandbox</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simulation Store — purchases update the Finance Hub in real-time
              </p>
            </div>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 text-sm">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Category filter bar ──────────────────────────────────────── */}
        <div className="max-w-screen-2xl mx-auto px-6 pb-3 flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground"
              }`}
            >
              {cat !== "all" && <Tag className="h-2.5 w-2.5" />}
              {cat === "all" ? "All Products" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
          <span className="ml-auto self-center text-xs text-muted-foreground">
            {displayItems.length} product{displayItems.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Product Grid ────────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-sm">No products in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {displayItems.map((item) => {
              const qty = getQty(item.sku);
              const isBuying = buying === item.sku;
              const isSoldOut = item.localStatus === "outOfStock";

              return (
                <Card
                  key={item.sku}
                  className={`flex flex-col overflow-hidden border-border/50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                    isSoldOut ? "opacity-60" : ""
                  }`}
                >
                  {/* Product image placeholder */}
                  <div className="relative">
                    <AspectRatio ratio={1}>
                      <div
                        className={`w-full h-full bg-gradient-to-br ${categoryGradient(item.productCategory)} flex flex-col items-center justify-center gap-2 group`}
                      >
                        <span className="text-3xl font-black text-white/10 group-hover:text-white/20 transition-all tracking-tight uppercase select-none">
                          {item.productCategory.slice(0, 3)}
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.25em] text-white/20 group-hover:text-white/40 transition-all">
                          {item.salesChannel}
                        </span>
                      </div>
                    </AspectRatio>

                    {/* Status badge — top right of image */}
                    <div className="absolute top-2 right-2">
                      <StockBadge status={item.localStatus} available={item.localAvailable} />
                    </div>

                    {/* Category label — bottom left */}
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-semibold">
                        {item.productCategory}
                      </span>
                    </div>
                  </div>

                  {/* Card metadata */}
                  <CardHeader className="pb-1 pt-3 px-4">
                    <CardTitle className="text-sm font-semibold leading-tight line-clamp-2 min-h-[2.5rem]">
                      {item.productTitle}
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground font-mono tracking-tight">
                      {item.sku}
                    </p>
                  </CardHeader>

                  <CardContent className="flex-grow px-4 pb-3 space-y-3">
                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold tabular-nums">
                        ${item.retailPrice.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">USD</span>
                    </div>

                    {/* Quantity stepper */}
                    {!isSoldOut && (
                      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-2 py-1.5">
                        <span className="text-xs font-medium text-muted-foreground pl-1">Qty</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-background"
                            onClick={() => changeQty(item.sku, -1, item.localAvailable)}
                            disabled={qty <= 1 || isBuying}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-5 text-center text-sm font-bold tabular-nums">{qty}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-background"
                            onClick={() => changeQty(item.sku, 1, item.localAvailable)}
                            disabled={qty >= item.localAvailable || isBuying}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="px-4 pb-4 pt-0">
                    <Button
                      className="w-full font-bold h-10 text-sm"
                      disabled={isSoldOut || isBuying}
                      onClick={() => handleBuy(item)}
                    >
                      {isBuying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing…
                        </>
                      ) : isSoldOut ? (
                        "Sold Out"
                      ) : (
                        <>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
