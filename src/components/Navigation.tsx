

import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, MessageCircle, Users, Lock, LogOut, LogIn, AlertTriangle, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VeritasUIContext } from '../App';

// Helper to fetch and show profile name
function ProfileName({ user }) {
  const [name, setName] = useState(user.user_metadata?.name || '');
  useEffect(() => {
    let ignore = false;
    async function fetchName() {
      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .single();
      if (!ignore && data && data.name) setName(data.name);
    }
    fetchName();
    return () => { ignore = true; };
  }, [user.id]);
  return <span>{name || user.user_metadata?.name || user.email}</span>;
}


const translations = {
  en: {
    home: 'Home',
    profileGuard: 'ProfileGuard',
    safetyAssistant: 'Safety Assistant',
    voice: 'Voice',
    imageCheck: 'Image Check',
    secureVault: 'Secure Vault',
    safetyAnalyzer: 'Safety Analyzer',
    report: 'Report',
    evidence: 'Evidence',
    quiz: 'Safety Quiz',
    verify: 'Verify Case',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    welcome: 'Welcome',
  },
  hi: {
    home: 'होम',
    profileGuard: 'प्रोफाइल गार्ड',
    safetyAssistant: 'सुरक्षा सहायक',
    voice: 'आवाज़',
    imageCheck: 'इमेज जांच',
    secureVault: 'सुरक्षित वॉल्ट',
    safetyAnalyzer: 'सुरक्षा विश्लेषक',
    report: 'रिपोर्ट',
    evidence: 'सबूत',
    quiz: 'सुरक्षा क्विज़',
    verify: 'मामला सत्यापित करें',
    signIn: 'साइन इन',
    signOut: 'साइन आउट',
    welcome: 'स्वागत है',
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    profileGuard: 'ಪ್ರೊಫೈಲ್ ಗಾರ್ಡ್',
    safetyAssistant: 'ಭದ್ರತಾ ಸಹಾಯಕ',
    voice: 'ಧ್ವನಿ',
    imageCheck: 'ಚಿತ್ರ ಪರಿಶೀಲನೆ',
    secureVault: 'ಸುರಕ್ಷಿತ ವಾಲ್ಟ್',
    safetyAnalyzer: 'ಭದ್ರತಾ ವಿಶ್ಲೇಷಕ',
    report: 'ವರದಿ',
    evidence: 'ಸಾಕ್ಷ್ಯ',
    quiz: 'ಭದ್ರತಾ ಪ್ರಶ್ನೋತ್ತರ',
    verify: 'ಕೇಸ್ ಪರಿಶೀಲಿಸಿ',
    signIn: 'ಸೈನ್ ಇನ್',
    signOut: 'ಸೈನ್ ಔಟ್',
    welcome: 'ಸ್ವಾಗತ',
  },
};

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };
  const { language } = useContext(VeritasUIContext);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="shadow-md sticky top-0 z-50 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2 mr-8">
              <Shield className="h-8 w-8 text-veritas-purple" />
              <span className="text-xl font-bold text-veritas-purple">VERITAS</span>
            </Link>
            <div className="hidden md:flex gap-4 items-center">
              <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">{translations[language].home}</Link>
              <Link to="/profile-guard" className="bg-gradient-to-r from-veritas-purple to-purple-400 text-white px-3 py-1.5 rounded shadow font-semibold hover:from-purple-600 hover:to-veritas-purple transition-colors border-2 border-veritas-purple">{translations[language].profileGuard}</Link>
              <Link to="/chatbot" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">{translations[language].safetyAssistant}</Link>
              <Link to="/voice-assistant" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors flex items-center gap-1 font-medium">
                <Mic className="h-4 w-4" /> {translations[language].voice}
              </Link>
              <Link to="/face-check" className="bg-gradient-to-r from-veritas-purple to-purple-400 text-white px-3 py-1.5 rounded shadow font-semibold hover:from-purple-600 hover:to-veritas-purple transition-colors border-2 border-veritas-purple">{translations[language].imageCheck}</Link>
              <Link to="/vault" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">{translations[language].secureVault}</Link>
              <Link to="/analyzer" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">{translations[language].safetyAnalyzer}</Link>
              <Link to="/report" className="bg-gradient-to-r from-veritas-purple to-purple-400 text-white px-3 py-1.5 rounded shadow font-semibold hover:from-purple-600 hover:to-veritas-purple transition-colors border-2 border-veritas-purple">{translations[language].report}</Link>
              <Link to="/evidence" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">{translations[language].evidence}</Link>
              <Link to="/quiz" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">{translations[language].quiz}</Link>
              <Link to="/verify" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">{translations[language].verify}</Link>
              {user ? (
                <>
                  <Link to="/profile" className="ml-4 font-medium text-veritas-purple underline">
                    {translations[language].welcome} <ProfileName user={user} />
                  </Link>
                  <button onClick={handleLogout} className="ml-2 btn-outline text-sm py-1.5 px-3 flex items-center">
                    <LogOut className="h-4 w-4 mr-1" />
                    {translations[language].signOut}
                  </button>
                </>
              ) : (
                <Link to="/signin" className="btn-outline text-sm py-1.5 px-3 flex items-center">
                  <LogIn className="h-4 w-4 mr-1" />
                  {translations[language].signIn}
                </Link>
              )}
            </div>
          </div>
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 dark:text-gray-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-3 py-3">
            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple py-2 transition-colors" onClick={toggleMenu}>Home</Link>
            <Link to="/profile-guard" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple py-2 transition-colors" onClick={toggleMenu}>ProfileGuard</Link>
            <Link to="/chatbot" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple py-2 transition-colors" onClick={toggleMenu}>
              <MessageCircle className="h-4 w-4 inline mr-1" /> Safety Assistant
            </Link>
            <Link to="/face-check" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple py-2 transition-colors" onClick={toggleMenu}>
              <Users className="h-4 w-4 inline mr-1" /> Image Check
            </Link>
            <Link to="/vault" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple py-2 transition-colors" onClick={toggleMenu}>
              <Lock className="h-4 w-4 inline mr-1" /> Secure Vault
            </Link>
            <Link to="/analyzer" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple py-2 transition-colors" onClick={toggleMenu}>
              <AlertTriangle className="h-4 w-4 inline mr-1" /> Safety Analyzer
            </Link>
            <Link to="/report" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple py-2 transition-colors" onClick={toggleMenu}>Report</Link>
            <Link to="/evidence" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple py-2 transition-colors" onClick={toggleMenu}>Evidence</Link>
            <Link to="/quiz" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple py-2 transition-colors" onClick={toggleMenu}>Safety Quiz</Link>
            <Link to="/verify" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple py-2 transition-colors" onClick={toggleMenu}>Verify Case</Link>
            <Link to="/signin" className="btn-outline text-center w-full mt-2" onClick={toggleMenu}>
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
