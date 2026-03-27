import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[var(--color-bg-surface)] p-10 rounded-3xl shadow-xl border border-[var(--color-border-subtle)] max-w-md w-full animate-fade-in relative overflow-hidden">
        
        {/* Decorative Background Element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

        <div className="mb-6 flex justify-center text-[var(--color-primary)]">
          <AlertTriangle size={80} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-4xl font-extrabold text-[var(--color-text-main)] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[var(--color-text-main)] mb-4">Page Not Found</h2>
        
        <p className="text-[var(--color-text-muted)] mb-8">
          The routing path you tried to access doesn't exist or you don't have permission to view it.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            <ArrowLeft size={18} className="mr-2" /> Go Back
          </Button>
          <Button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
            <Home size={18} className="mr-2" /> Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
