import React from 'react';
import { LiveTicker } from '../components/LiveTicker';
import { FinanceChart } from '../components/FinanceChart';
import { CrossChannelMatrix } from '../components/CrossChannelMatrix';
import { KpiCards } from '../components/KpiCards';

export default function FinanceHub() {
  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Financial Intelligence Hub</h1>
        <p className="text-muted-foreground">
          Real-time profitability engine, cross-channel ROI, and working capital analytics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCards />
      </div>

      <div className="grid gap-6 md:grid-cols-7 h-[600px] lg:h-[480px]">
        <div className="col-span-4 lg:col-span-5 h-[480px]">
          <FinanceChart />
        </div>
        <div className="col-span-3 lg:col-span-2 h-[480px]">
          <LiveTicker />
        </div>
      </div>

      <div className="mt-6">
        <CrossChannelMatrix />
      </div>
    </div>
  );
}
