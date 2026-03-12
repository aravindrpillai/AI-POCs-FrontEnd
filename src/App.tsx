import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ClaimsWelcome from "./pages/claims/Welcome";
import Index from "./pages/claims/Index";
import NotFound from "./pages/NotFound";


import CvWelcome from "./pages/cv/Welcome";
import UploadResume from "./pages/cv/UploadResume";
import SearchCandidates from "./pages/cv/SearchCandidates";
import CandidateProfile from "./pages/cv/CandidateProfile";
import MedAIWelcome from "./pages/med-ai/Welcome";
import MedAIDiagnostics from "./pages/med-ai/Diagnostics";
import MedAIConversation from "./pages/med-ai/Conversation";
import FinanceWelcome from "./pages/finance/Welcome";
import FinanceQuestions from "./pages/finance/Questions";
import FinanceSummary from "./pages/finance/Summary";
import OllamaWelcome from "./pages/ollama/Welcome";
import OllamaChat from "./pages/ollama/Chat";
import FileAnalyserWelcome from "./pages/file-analyser/Welcome";
import FileAnalyserUpload from "./pages/file-analyser/Upload";
import FileAnalyserChat from "./pages/file-analyser/Chat";
import QuestionsWelcome from "./pages/questions/Welcome";
import QuestionsQuiz from "./pages/questions/Quiz";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/claims" element={<ClaimsWelcome />} />
          <Route path="/claims/" element={<ClaimsWelcome />} />
          <Route path="/claim" element={<Navigate to="/claim/new" replace />} />
          <Route path="/claim/" element={<Navigate to="/claim/new" replace />} />
          <Route path="/claim/:convId" element={<Index />} />

          <Route path="/cv" element={<CvWelcome />} />
          <Route path="/cv/uploadresume" element={<UploadResume />} />
          <Route path="/cv/profile/:id" element={<CandidateProfile />} />
          <Route path="/cv/search" element={<SearchCandidates />} />

          <Route path="/med-ai" element={<MedAIWelcome />} />
          <Route path="/med-ai/diagnose" element={<MedAIDiagnostics />} />
          <Route path="/med-ai/diagnose/:convId" element={<MedAIConversation />} />

          <Route path="/finance-advisor" element={<FinanceWelcome />} />
          <Route path="/finance-advisor/questions/" element={<FinanceQuestions />} />
          <Route path="/finance-advisor/questions/:sessionId" element={<FinanceQuestions />} />
          <Route path="/finance-advisor/summary/:sessionId" element={<FinanceSummary />} />
          

          <Route path="/ollama" element={<OllamaWelcome />} />
          <Route path="/ollama/chat" element={<OllamaChat />} />

          <Route path="/file-analyser" element={<FileAnalyserWelcome />} />
          <Route path="/file-analyser/upload" element={<FileAnalyserUpload />} />
          <Route path="/file-analyser/chat/:sessionId" element={<FileAnalyserChat />} />

          <Route path="/questions" element={<QuestionsWelcome />} />
          <Route path="/questions/quiz" element={<QuestionsQuiz />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
