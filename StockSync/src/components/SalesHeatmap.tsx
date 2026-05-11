import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Import static data directly from the frontend data directory
import inventoryData from '../data/inventory_data.json';
import salesData from '../data/sales_history.json';



interface SalesHeatmapProps {
  className?: string;
}

interface InventoryItem {
  sku?: string;
  lat?: number;
  lng?: number;
}

interface SalesItem {
  sku?: string;
  gross_revenue?: number;
  quantity?: number;
}

// 1. Process the static data
const getHeatmapData = (): [number, number, number][] => {
  const revenueMap: Record<string, number> = {};

  // Cross-reference the sku with gross_revenue
  (salesData as SalesItem[]).forEach((tx) => {
    if (tx.sku && tx.gross_revenue) {
      if (!revenueMap[tx.sku]) {
        revenueMap[tx.sku] = 0;
      }
      revenueMap[tx.sku] += tx.gross_revenue;
    }
  });

  const points: [number, number, number][] = [];
  let maxRev = 0;

  (inventoryData as InventoryItem[]).forEach((item) => {
    if (item.lat && item.lng && item.sku) {
      const revenue = revenueMap[item.sku] || 0;
      if (revenue > maxRev) maxRev = revenue;
      points.push([item.lat, item.lng, revenue]);
    }
  });

  // Artificial Baseline: Give 0-revenue regions a baseline visual weight 
  // so the map has ambient "Active Region" blue glow across all nodes
  const baseline = maxRev > 0 ? maxRev * 0.15 : 100;
  points.forEach((p) => {
    if (p[2] === 0) {
      p[2] = baseline;
    }
  });

  return points;
};

// Custom component to attach the Leaflet.heat layer
const HeatLayer = ({ points }: { points: [number, number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Find the max revenue to scale the heatmap properly
    const maxRevenue = Math.max(...points.map((p) => p[2]));

    // Use a "Blue-to-Cyan" gradient (avoid red/yellow)
    const heatOptions = {
      radius: 25, // Increased radius for more coverage
      blur: 20,   // Increased blur for a smoother glow
      maxZoom: 15,
      max: maxRevenue, 
      gradient: {
        0.0: 'rgba(0,0,0,0)',
        0.1: '#003366', // Deep blue edge
        0.2: '#0055AA', // Active Region (Blue)
        0.5: '#00BFFF', // Transition
        0.8: '#00FFFF', // High Velocity (Cyan)
        1.0: '#FFFFFF', // Peak core
      },
    };

    // Cast L to any to bypass TS complaining about .heatLayer which isn't standard in base Leaflet
    const heatLayer = (L as any).heatLayer(points, heatOptions).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

export const SalesHeatmap: React.FC<SalesHeatmapProps> = ({ className }) => {
  const points = getHeatmapData();

  return (
    <Card className={`relative overflow-hidden w-full h-[600px] bg-[#121212] border-slate-800 ${className || ''}`}>
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[41.3275, 19.8187]} // Centered on Tirana/Balkan coordinates
          zoom={6}
          style={{ width: '100%', height: '100%', background: '#121212' }}
          zoomControl={false}
          scrollWheelZoom={false}
          dragging={false} // Static (fixed view) constraint
          doubleClickZoom={false}
          keyboard={false}
        >
          {/* Desaturated greyscale base map (Carto Dark Matter) */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <HeatLayer points={points} />
        </MapContainer>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-md">
        <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-2">Sales Density</h4>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00FFFF]" />
              <span className="text-slate-300 text-[10px]">High Velocity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0055AA]" />
              <span className="text-slate-300 text-[10px]">Active Region</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SalesHeatmap;
