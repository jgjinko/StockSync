import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MatrixData {
  channel: string;
  gross_revenue: number;
  platform_fees: number;
  unit_costs: number;
  shipping: number;
  transactions: number;
  net_profit: number;
  roi: number;
}

export function CrossChannelMatrix() {
  const [data, setData] = useState<MatrixData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/finance/matrix');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error('Failed to fetch matrix', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Cross-Channel Performance Matrix</CardTitle>
        <CardDescription>Profitability comparison minus operational costs and platform fees.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted/50 rounded" />
            <div className="h-10 bg-muted/50 rounded" />
            <div className="h-10 bg-muted/50 rounded" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Gross Rev</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Fees & Subs</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Est. COGS</TableHead>
                  <TableHead className="text-right">Net Profit</TableHead>
                  <TableHead className="text-right">ROI Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.channel}>
                    <TableCell className="font-medium">{row.channel}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.gross_revenue)}</TableCell>
                    <TableCell className="text-right text-red-500 hidden md:table-cell">- {formatCurrency(row.platform_fees)}</TableCell>
                    <TableCell className="text-right text-red-500 hidden sm:table-cell">- {formatCurrency(row.unit_costs)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(row.net_profit)}</TableCell>
                    <TableCell className="text-right">
                      <div className={`inline-flex items-center gap-1 font-bold ${row.roi >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {row.roi >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {row.roi.toFixed(1)}%
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center h-24">No channel metrics mapped.</TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
