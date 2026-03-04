import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/claims/Index";
import NotFound from "./pages/NotFound";

import UploadResume from "./pages/cv/UploadResume";
import SearchCandidates from "./pages/cv/SearchCandidates";
import CandidateProfile from "./pages/cv/CandidateProfile";
import MedAIWelcome from "./pages/med-ai/Welcome";
import MedAIDiagnostics from "./pages/med-ai/Diagnostics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/claim" element={<Navigate to="/claim/new" replace />} />
          <Route path="/claim/:convId" element={<Index />} />

          <Route path="/cv/uploadresume" element={<UploadResume />} />
          <Route path="/cv/profile/:id" element={<CandidateProfile />} />
          <Route path="/cv/search" element={<SearchCandidates />} />

          <Route path="/med-ai" element={<MedAIWelcome />} />
          <Route path="/med-ai/diagnose" element={<MedAIDiagnostics />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
