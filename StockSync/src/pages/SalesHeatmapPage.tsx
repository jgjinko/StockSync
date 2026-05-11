import { SalesHeatmap } from "../components/SalesHeatmap";

export default function SalesHeatmapPage() {
  return (
    <div className="py-6 px-4 md:px-8">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Regional Sales Intelligence</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Real-time geographic distribution of gross revenue across the Balkan Peninsula.
        </p>
      </div>
      <SalesHeatmap />
    </div>
  );
}
