import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Providers } from "./providers";
import { SideNav } from "./components/nav";
import Dashboard from "./pages/Dashboard";
import FinanceHub from "./pages/FinanceHub";
import DemoStore from "./pages/DemoStore";
import InventoryManagement from "./pages/InventoryManagement";
import SalesHeatmapPage from "./pages/SalesHeatmapPage";
import { Toaster } from "./components/ui/toaster";
import "./style/globals.css";

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <div className="flex min-h-[100dvh]">
          <SideNav />
          <div className="flex-grow overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/finance" element={<FinanceHub />} />
              <Route path="/management" element={<InventoryManagement />} />
              <Route path="/demo-store" element={<DemoStore />} />
              <Route path="/heatmap" element={<SalesHeatmapPage />} />
            </Routes>
          </div>
        </div>
        <Toaster />
      </Providers>
    </BrowserRouter>
  );
}
