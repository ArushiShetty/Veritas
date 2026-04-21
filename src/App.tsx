import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ProfileGuard from "./pages/ProfileGuard";
// import ProfileGuardScanner from "./pages/ProfileGuardScanner";
import ReportSubmission from "./pages/ReportSubmission";
import Evidence from "./pages/Evidence";
import Quiz from "./pages/Quiz";
import Verify from "./pages/Verify";
import NotFound from "./pages/NotFound";
import Chatbot from "./pages/Chatbot";
import FaceCheck from "./pages/FaceCheck";
import EmergencyVault from "./pages/EmergencyVault";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import SafetyAnalyzer from "./pages/SafetyAnalyzer";
import VoiceAssistant from "./pages/VoiceAssistant";
import Profile from "./pages/Profile";
import { useEffect, useState, createContext } from "react";

const queryClient = new QueryClient();

// Language and Theme Context
export const VeritasUIContext = createContext({
  language: 'en',
  setLanguage: (_: string) => {},
  darkMode: false,
  setDarkMode: (_: boolean) => {},
});

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

const App = () => {
  const [language, setLanguage] = useState(() => localStorage.getItem('veritas-lang') || 'en');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('veritas-dark') === 'true');
  // Persist language and theme
  useEffect(() => {
    localStorage.setItem('veritas-lang', language);
  }, [language]);
  useEffect(() => {
    localStorage.setItem('veritas-dark', darkMode ? 'true' : 'false');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <VeritasUIContext.Provider value={{ language, setLanguage, darkMode, setDarkMode }}>
          <div className={darkMode ? 'dark bg-gray-900 text-white min-h-screen' : 'bg-white min-h-screen'}>
            {/* Global toggles bar */}
            <div className={"w-full flex justify-end items-center gap-4 px-6 py-2 border-b bg-white/80 dark:bg-gray-900/80 sticky top-0 z-40"}>
              <label htmlFor="veritas-lang" className="font-medium mr-1">🌐</label>
              <select
                id="veritas-lang"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="rounded px-2 py-1 border dark:bg-gray-800 dark:text-white"
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <button
                onClick={() => setDarkMode(d => !d)}
                className="px-3 py-1 rounded border font-medium ml-2 dark:bg-gray-800 dark:text-white"
              >
                {darkMode ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Index />} />
                <Route path="/profile-guard" element={<ProfileGuard />} />
                <Route path="/report" element={<ReportSubmission />} />
                <Route path="/evidence" element={<Evidence />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/face-check" element={<FaceCheck />} />
                <Route path="/vault" element={<EmergencyVault />} />
                <Route path="/analyzer" element={<SafetyAnalyzer />} />
                <Route path="/voice-assistant" element={<VoiceAssistant />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </VeritasUIContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
