import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface SaleEvent {
  id: string;
  sku: string;
  product_name: string;
  channel: string;
  quantity: number;
  gross_value: number;
  timestamp: number;
}

const CHANNEL_COLORS: Record<string, string> = {
  'Demo Store':   'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'Shopify':      'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Amazon':       'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'TikTok Shop':  'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'Physical POS': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

function channelBadgeClass(channel: string) {
  return CHANNEL_COLORS[channel] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30';
}

function relativeTime(unixTs: number): string {
  const diffSec = Math.floor(Date.now() / 1000 - unixTs);
  if (diffSec < 60)  return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(unixTs * 1000).toLocaleDateString();
}

export function LiveTicker() {
  const [events, setEvents] = useState<SaleEvent[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [lastCount, setLastCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/finance/ticker?limit=30');
        if (response.ok) {
          const newEvents: SaleEvent[] = await response.json();
          if (mounted && newEvents.length > 0) {
            setEvents(newEvents);
            setIsListening(true);
            setLastCount(newEvents.length);
          }
        }
      } catch (error) {
        console.error('Failed to fetch ticker data', error);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 5000); // poll every 5s to pick up demo store purchases quickly

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Card className="h-full flex flex-col border-emerald-900/20 shadow-lg dark:border-emerald-500/20">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isListening && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isListening ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            </span>
            Live Revenue Stream
          </CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            {lastCount > 0 ? `${lastCount} transactions` : '5s lag'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[340px] px-4 py-2">
          <div className="space-y-3 pt-2">
            {events.length === 0 ? (
              <div className="animate-pulse flex items-center justify-center h-20">
                <span className="text-sm text-muted-foreground">Listening for transactions...</span>
              </div>
            ) : (
              events.map((event, index) => (
                <div
                  key={event.id}
                  className={`flex flex-col gap-1.5 border-b pb-3 last:border-0 last:pb-0 ${
                    index === 0 ? 'animate-in fade-in slide-in-from-top-2 duration-500' : ''
                  }`}
                >
                  {/* Row 1: Product name + revenue */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground leading-tight line-clamp-1 flex-1">
                      {event.product_name}
                    </span>
                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap tabular-nums">
                      +${event.gross_value.toFixed(2)}
                    </span>
                  </div>

                  {/* Row 2: SKU + quantity sold */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground tracking-tight">
                      {event.sku}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {event.quantity} unit{event.quantity !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Row 3: Channel badge + timestamp */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${channelBadgeClass(event.channel)}`}
                    >
                      {event.channel}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {relativeTime(event.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
