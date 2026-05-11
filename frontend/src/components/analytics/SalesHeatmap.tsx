'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';

// Replace with your actual Mapbox token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NndycTAwNGYycXBndWRqcmZyeekifQ.m_6_7_7_7_7_7_7_7_7_7_7';

interface SalesHeatmapProps {
  className?: string;
}

interface HoverInfo {
  productTitle: string;
  revenue: number;
  x: number;
  y: number;
}

export const SalesHeatmap: React.FC<SalesHeatmapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Desaturated grayscale/charcoal
      center: [19.8187, 41.3275], // Centered on Albania
      zoom: 6,
      antialias: true,
    });

    const m = map.current;

    m.on('load', async () => {
      try {
        const response = await fetch('http://localhost:8000/api/analytics/sales-heatmap');
        const data = await response.json();

        m.addSource('sales', {
          type: 'geojson',
          data: data,
        });

        // 1. Heatmap Layer - Electric Blue "Pulse" Zones
        m.addLayer({
          id: 'sales-heat',
          type: 'heatmap',
          source: 'sales',
          maxzoom: 15,
          paint: {
            // Increase weight as revenue increases
            'heatmap-weight': {
              property: 'revenue',
              type: 'exponential',
              stops: [
                [1, 0],
                [10000, 1],
              ],
            },
            // Increase intensity based on zoom level
            'heatmap-intensity': {
              stops: [
                [0, 1],
                [9, 3],
              ],
            },
            // Color ramp for heatmap.  0-light blue, 1-electric blue
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 0, 0)',
              0.2, 'rgba(0, 229, 255, 0.2)',
              0.4, 'rgba(0, 229, 255, 0.4)',
              0.6, 'rgba(0, 229, 255, 0.6)',
              0.8, 'rgba(0, 229, 255, 0.8)',
              1, '#00E5FF',
            ],
            // Adjust the heatmap radius by zoom level
            'heatmap-radius': {
              stops: [
                [0, 2],
                [9, 20],
              ],
            },
            // Transition from heatmap to circle layer by zoom level
            'heatmap-opacity': {
              default: 1,
              stops: [
                [14, 1],
                [15, 0],
              ],
            },
          },
        });

        // 2. Point Layer - High-Contrast Tooltip Targets
        m.addLayer({
          id: 'sales-point',
          type: 'circle',
          source: 'sales',
          minzoom: 5,
          paint: {
            'circle-radius': {
              stops: [
                [5, 4],
                [15, 12],
              ],
            },
            'circle-color': '#00E5FF',
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            'circle-opacity': {
              stops: [
                [13, 0],
                [14, 0.8],
              ],
            },
          },
        });

        setLoading(false);

        // Hover Interactions
        m.on('mousemove', 'sales-point', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties as { productTitle: string; revenue: number };
            
            setHoverInfo({
              productTitle: props.productTitle,
              revenue: props.revenue,
              x: e.point.x,
              y: e.point.y,
            });
            m.getCanvas().style.cursor = 'pointer';
          }
        });

        m.on('mouseleave', 'sales-point', () => {
          setHoverInfo(null);
          m.getCanvas().style.cursor = '';
        });

      } catch (error) {
        console.error('Failed to load heatmap data:', error);
        setLoading(false);
      }
    });

    return () => {
      m.remove();
    };
  }, []);

  return (
    <Card className={`relative overflow-hidden w-full h-[600px] bg-[#121212] border-slate-800 ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-sm font-medium">Synchronizing Regional Data...</span>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="w-full h-full" />

      {hoverInfo && (
        <div
          className="absolute z-20 pointer-events-none p-3 rounded-lg border border-white/10 bg-black/80 backdrop-blur-md shadow-2xl transition-all duration-75"
          style={{
            left: hoverInfo.x + 15,
            top: hoverInfo.y - 15,
          }}
        >
          <p className="text-xs font-bold text-[#00E5FF] uppercase tracking-wider mb-1">
            Revenue Intelligence
          </p>
          <p className="text-white font-medium text-sm leading-tight mb-2">
            {hoverInfo.productTitle}
          </p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 text-xs italic">Total Gross</span>
            <span className="text-white font-mono font-bold">
              ${hoverInfo.revenue.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-6 right-6 z-10 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-md">
        <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-2">Sales Density</h4>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00E5FF]" />
              <span className="text-slate-300 text-[10px]">High Velocity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00E5FF]/30" />
              <span className="text-slate-300 text-[10px]">Active Region</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
