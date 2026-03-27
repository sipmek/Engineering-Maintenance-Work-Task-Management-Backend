import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Key, User, Moon, Sun, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { login, isAuthenticated } = useAuth();

  // Redirect if currently logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[var(--color-bg-body)] transition-colors duration-300 relative overflow-hidden">
      
      {/* Decorative Background Elements (Sims-inspired playful blobs) */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[var(--color-primary)] rounded-full mix-blend-multiply opacity-20 dark:opacity-10 blur-3xl animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-[var(--color-secondary)] rounded-full mix-blend-multiply opacity-20 dark:opacity-10 blur-3xl animate-blob animation-delay-2000"></div>

      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-[var(--color-bg-surface)] shadow-md text-[var(--color-text-main)] hover:bg-[var(--color-border-subtle)] transition-all duration-300 hover:scale-105 active:scale-95 z-20"
      >
        {isDark ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* Login Card */}
      <div className="w-full max-w-4xl bg-[var(--color-bg-surface)] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 border border-[var(--color-border-subtle)]">
        
        {/* Left Side - Branding */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white relative">
          {/* Overlay to soften the gradient in dark mode especially */}
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
              MTMS
            </h1>
            <div>
              <p className="text-xl font-medium mb-2 drop-shadow-sm">Work Management System</p>
              <p className="text-sm opacity-90 leading-relaxed max-w-xs">
                Kelola tugas, kolaborasi tim, dan anggaran proyekmu dengan rapi dan efisien.
              </p>
            </div>
            {/* Playful abstract shapes here could be added */}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-3xl font-bold text-[var(--color-text-main)] mb-2">Welcome Back</h2>
            <p className="text-[var(--color-text-muted)] mb-8">Please enter your details to sign in.</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <Input
                  label="Username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-11" // extra padding for icon
                  required
                />
                <User size={20} className="absolute left-4 top-[38px] text-[var(--color-text-muted)]" />
              </div>

              <div className="relative">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11" // extra padding for icon
                  required
                />
                <Key size={20} className="absolute left-4 top-[38px] text-[var(--color-text-muted)]" />
              </div>

              {error && (
                <div className="flex items-center p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/50">
                  <AlertCircle size={16} className="mr-2" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-4 text-lg font-semibold shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-[var(--color-primary)]/50 group"
              >
                {isLoading ? (
                  <span className="animate-pulse">Signing In...</span>
                ) : (
                  <><LogIn size={20} className="mr-2 group-hover:-translate-y-0.5 transition-transform" /> Sign In</>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
               {/* Soft subtle text for standard enterprise feel */}
              <p className="text-sm text-[var(--color-text-muted)] mt-12">
                &copy; {new Date().getFullYear()} MTMS System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
