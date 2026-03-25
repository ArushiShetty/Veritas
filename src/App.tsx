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
import { useEffect, useState, createContext } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
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

  useEffect(() => {
    // Check current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session);
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setIsLoggedIn(!!session);
        setUserId(session?.user?.id || null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  // Show loading state while checking authentication
  if (isLoggedIn === null) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }

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
                {/* Public routes */}
                <Route path="/signin" element={!isLoggedIn ? <SignIn /> : <Navigate to="/" />} />
                <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
                <Route path="/" element={<Index />} />
                <Route path="/profile-guard" element={<ProfileGuard />} />
                {/* Protected routes - redirect to login if not authenticated */}
                <Route path="/report" element={isLoggedIn ? <ReportSubmission /> : <Navigate to="/signin" />} />
                <Route path="/evidence" element={isLoggedIn ? <Evidence /> : <Navigate to="/signin" />} />
                <Route path="/quiz" element={isLoggedIn ? <Quiz /> : <Navigate to="/signin" />} />
                <Route path="/verify" element={isLoggedIn ? <Verify /> : <Navigate to="/signin" />} />
                <Route path="/chatbot" element={isLoggedIn ? <Chatbot /> : <Navigate to="/signin" />} />
                <Route path="/face-check" element={isLoggedIn ? <FaceCheck /> : <Navigate to="/signin" />} />
                <Route path="/vault" element={isLoggedIn ? <EmergencyVault /> : <Navigate to="/signin" />} />
                <Route path="/analyzer" element={isLoggedIn ? <SafetyAnalyzer /> : <Navigate to="/signin" />} />
                <Route path="/voice-assistant" element={isLoggedIn ? <VoiceAssistant /> : <Navigate to="/signin" />} />
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
