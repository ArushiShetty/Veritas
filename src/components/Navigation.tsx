import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, MessageCircle, Users, Lock, LogOut, LogIn, AlertTriangle, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleLogout = () => navigate('/');

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
              <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">Home</Link>
              <Link to="/profile-guard" className="bg-gradient-to-r from-veritas-purple to-purple-400 text-white px-3 py-1.5 rounded shadow font-semibold hover:from-purple-600 hover:to-veritas-purple transition-colors border-2 border-veritas-purple">ProfileGuard</Link>
              <Link to="/chatbot" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">Safety Assistant</Link>
              <Link to="/voice-assistant" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors flex items-center gap-1 font-medium">
                <Mic className="h-4 w-4" /> Voice
              </Link>
              <Link to="/face-check" className="bg-gradient-to-r from-veritas-purple to-purple-400 text-white px-3 py-1.5 rounded shadow font-semibold hover:from-purple-600 hover:to-veritas-purple transition-colors border-2 border-veritas-purple">Image Check</Link>
              <Link to="/vault" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">Secure Vault</Link>
              <Link to="/analyzer" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">Safety Analyzer</Link>
              <Link to="/report" className="bg-gradient-to-r from-veritas-purple to-purple-400 text-white px-3 py-1.5 rounded shadow font-semibold hover:from-purple-600 hover:to-veritas-purple transition-colors border-2 border-veritas-purple">Report</Link>
              <Link to="/evidence" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">Evidence</Link>
              <Link to="/quiz" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">Safety Quiz</Link>
              <Link to="/verify" className="text-gray-700 dark:text-gray-200 hover:text-veritas-purple transition-colors font-medium">Verify Case</Link>
              <Link to="/signin" className="btn-outline text-sm py-1.5 px-3 flex items-center">
                <LogIn className="h-4 w-4 mr-1" />
                Sign In
              </Link>
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
