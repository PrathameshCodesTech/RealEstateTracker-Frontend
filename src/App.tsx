import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import DigitalTwin from "./pages/DigitalTwin";
import Tasks from "./pages/Tasks";
import Timeline from "./pages/Timeline";
import HurdleTracker from "./pages/HurdleTracker";
import Resources from "./pages/Resources";
import Checklists from "./pages/Checklists";
import Compliance from "./pages/Compliance";
import Handover from "./pages/Handover";
import Society from "./pages/Society";
import Documents from "./pages/Documents";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import Admin from "./pages/Admin";
import DelayPrediction from "./pages/DelayPrediction";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ceo-dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<Projects />} />
        <Route path="/digital-twin" element={<DigitalTwin />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/hurdles" element={<HurdleTracker />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/checklists" element={<Checklists />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/handover" element={<Handover />} />
        <Route path="/society" element={<Society />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/delay-prediction" element={<DelayPrediction />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
