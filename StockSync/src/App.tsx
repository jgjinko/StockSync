import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Providers } from "./providers";
import { SideNav } from "./components/nav";
import Dashboard from "./pages/Dashboard";
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
            </Routes>
          </div>
        </div>
      </Providers>
    </BrowserRouter>
  );
}
