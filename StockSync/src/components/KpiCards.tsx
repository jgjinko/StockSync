import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { InfoIcon } from 'lucide-react';

interface KpiData {
  net_margin: number;
  aov: number;
  dead_stock_value: number;
}

export function KpiCards() {
  const [data, setData] = useState<KpiData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/finance/kpi');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="col-span-1 md:col-span-2 lg:col-span-4 h-32 flex items-center justify-center border rounded-xl bg-card text-muted-foreground">
        Failed to load KPIs
      </div>
    );
  }

  if (!data) {
    return (
      <>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="flex flex-col justify-between h-32 animate-pulse bg-muted/20" />
        ))}
      </>
    );
  }

  const kpis = [
    { 
      title: "Net Margin Tracker", 
      value: `$${data.net_margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      desc: "Gross Sales - (COGS + Fees + Shipping)",
      status: data.net_margin > 10000 ? "text-green-500" : (data.net_margin > 0 ? "text-amber-500" : "text-red-500")
    },
    { 
      title: "Average Order Value", 
      value: `$${data.aov.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      desc: "Total revenue / Total orders",
      status: "text-foreground"
    },
    { 
      title: "Dead Stock Value", 
      value: `$${data.dead_stock_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      desc: "Capital tied in 0-velocity items",
      status: data.dead_stock_value > 5000 ? "text-red-500" : "text-amber-500"
    },
    { 
      title: "Projected Monthly", 
      value: `$${(data.net_margin * 4).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      desc: "Based on current 7d velocity",
      status: "text-green-500"
    }
  ];

  return (
    <>
      {kpis.map((kpi, i) => (
        <Card key={i} className="flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <CardHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{kpi.desc}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className={`text-2xl font-bold ${kpi.status}`}>{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
