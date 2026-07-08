import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { useAuth } from "./hooks/useAuth";
import { ATSChecker } from "./pages/ATSChecker";
import { CoverLetter } from "./pages/CoverLetter";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ResumeBuilder } from "./pages/ResumeBuilder";
import { Settings } from "./pages/Settings";
import { Templates } from "./pages/Templates";

function FullScreenSpinner() {
  return (
    <div className="h-screen w-full bg-bg flex items-center justify-center">
      <div className="flex items-center gap-3 text-text-gray text-sm font-medium">
        <div className="w-[30px] h-[30px] rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-sm">
          R
        </div>
        Loading ResumeAI...
      </div>
    </div>
  );
}

function Protected({ children }: { children: ReactNode }) {
  const { initialized, isAuthenticated } = useAuth();
  if (!initialized) return <FullScreenSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { initialized, isAuthenticated } = useAuth();
  if (!initialized) return <FullScreenSpinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

      <Route element={<Protected><AppLayout /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resumes/:id/edit" element={<ResumeBuilder />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/ats-checker" element={<ATSChecker />} />
        <Route path="/cover-letter" element={<CoverLetter />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
