import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type Timeframe = '24h' | '7d' | '30d' | 'ytd';

interface TrendData {
  label: string;
  gross: number;
  net: number;
}

export function FinanceChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/finance/trends?timeframe=${timeframe}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error('Error fetching trends', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeframe]);

  return (
    <Card className="h-full flex flex-col border-emerald-900/20 shadow-lg dark:border-emerald-500/20 transition-all">
      <CardHeader className="pb-2 border-b flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-medium">Time-Series Analytics</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Cross-channel Revenue & Profitability Trends</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {(['24h', '7d', '30d', 'ytd'] as Timeframe[]).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeframe === tf ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 grid grid-rows-2 gap-4">
        {loading ? (
           <div className="row-span-2 flex items-center justify-center h-full">
             <div className="animate-pulse text-muted-foreground">Loading Analytics...</div>
           </div>
        ) : (
          <>
            <div className="h-full min-h-[160px]">
              <div className="text-xs font-semibold mb-2 text-slate-500 flex items-center justify-between">
                <span>Gross Revenue</span>
                <span>Area Trend</span>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `$${val > 1000 ? (val/1000).toFixed(1)+'k' : val}`} width={60} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Gross Rev']} 
                  />
                  <Area type="monotone" dataKey="gross" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGross)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-full min-h-[160px]">
              <div className="text-xs font-semibold mb-2 text-slate-500 flex items-center justify-between">
                <span>Net Profit</span>
                <span>Bar Distribution</span>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `$${val > 1000 ? (val/1000).toFixed(1)+'k' : val}`} width={60} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Net Profit']} 
                  />
                  <Bar dataKey="net" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={timeframe === '24h' || timeframe === '30d' ? 6 : 24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
