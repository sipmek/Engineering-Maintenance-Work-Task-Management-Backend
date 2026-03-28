import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Key, User, Moon, Sun, AlertCircle, Activity, CheckCircle2, Users, PieChart, ShieldCheck } from 'lucide-react';
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
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-[#2bda6b] via-[#0ea5e9] to-[#8b5cf6] text-white relative overflow-hidden">
          {/* Decorative Blobs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            {/* Logo Section */}
            <div className="flex items-center gap-3 mb-12">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-xl">
                <Activity size={28} className="text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">MTMS</h1>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                  Engineering <br />
                  <span className="text-white/80">Maintenance Hub</span>
                </h2>
                <p className="text-lg text-white/90 leading-relaxed max-w-sm">
                  Elevate your technical operations with a unified work management system.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-5">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="font-medium">Streamlined Task Workflow</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                    <Users size={20} />
                  </div>
                  <span className="font-medium">Real-time Team Collaboration</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                    <PieChart size={20} />
                  </div>
                  <span className="font-medium">Detailed Budget Analytics</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="font-medium">Enterprise-grade Security</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-auto">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <div className="w-8 h-[1px] bg-white/30"></div>
              <span>Trusted by MTMS Engineering Team</span>
            </div>
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
