import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import WatchDetail from "./pages/WatchDetail";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import DatejustShowcase from "./pages/DatejustShowcase";
import WatchEditor from "./pages/WatchEditor";
import ConditionGuide from "./pages/ConditionGuide";
import ListingManager from "./pages/ListingManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ExitIntentPopup />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/watch/:id" element={<WatchDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/datejust" element={<DatejustShowcase />} />
          <Route path="/studio" element={<WatchEditor />} />
          <Route path="/conditions" element={<ConditionGuide />} />
          <Route path="/manage" element={<ListingManager />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
