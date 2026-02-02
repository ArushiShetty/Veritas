
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, Shield } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface AuthState {
  isLoading: boolean;
  isGoogleLoading: boolean;
  email: string;
  password: string;
  isSignUp: boolean;
  confirmPassword: string;
}

const Login = () => {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    isGoogleLoading: false,
    email: '',
    password: '',
    isSignUp: false,
    confirmPassword: '',
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const toggleAuthMode = () => {
    setState({
      ...state,
      isSignUp: !state.isSignUp,
    });
  };

  const handleGoogleLogin = async () => {
    setState({ ...state, isGoogleLoading: true });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Google sign in failed",
        variant: "destructive",
      });
      setState({ ...state, isGoogleLoading: false });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ ...state, isLoading: true });

    try {
      if (state.isSignUp) {
        if (state.password !== state.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords don't match.",
            variant: "destructive",
          });
          setState({ ...state, isLoading: false });
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: state.email,
          password: state.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Registration successful! Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: state.email,
          password: state.password,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Login successful!",
        });
        
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setState({ ...state, isLoading: false });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow bg-gray-50 flex justify-center items-center py-12">
        <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-md">
          <div className="flex justify-center mb-6">
            <Shield className="h-12 w-12 text-veritas-purple" />
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            {state.isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-center text-gray-600 mb-6">
            {state.isSignUp 
              ? 'Sign up to access all VERITAS safety features' 
              : 'Sign in to access your secure VERITAS account'}
          </p>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={state.isGoogleLoading}
            className="w-full flex items-center justify-center gap-2 py-2 border-gray-300 hover:bg-gray-50"
          >
            {state.isGoogleLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in with Google...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={state.email}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-veritas-purple"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={state.password}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-veritas-purple"
                  minLength={6}
                />
              </div>
            </div>
            
            {state.isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={state.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-veritas-purple"
                  />
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={state.isLoading}
              className="w-full bg-veritas-purple hover:bg-veritas-darkPurple py-2"
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {state.isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>{state.isSignUp ? 'Create Account' : 'Sign In'}</>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {state.isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="ml-1 text-veritas-purple hover:underline font-medium"
              >
                {state.isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
          
          {!state.isSignUp && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-veritas-purple hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
