import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Layout,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-[var(--color-bg-surface)] p-6 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 transition-transform group-hover:scale-110`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="text-[var(--color-text-muted)] text-sm font-medium">{title}</h3>
      <div className="text-3xl font-bold text-[var(--color-text-main)] tracking-tight">{value}</div>
      {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-1">{subtitle}</p>}
    </div>
  </div>
);

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/stats');
        // Standardized response is { status, message, data: { ...stats } }
        setStats(response.data.data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  const isAdminOrEmperor = ['admin', 'emperor'].includes(user?.role);

  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-text-main)] tracking-tight">
            Hello, {user?.username} <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1 font-medium">
            {isAdminOrEmperor 
              ? "Here's the system-wide overview for today." 
              : "Here's an update on your assigned tasks."}
          </p>
        </div>
        <Link to="/dashboard/tasks">
          <button className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:bg-[var(--color-secondary)] transition-all hover:-translate-y-0.5 active:translate-y-0">
            View My Tasks <ArrowRight size={18} />
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Tasks" 
          value={stats?.tasks?.total || 0} 
          icon={Layout} 
          color="bg-blue-500 text-blue-500"
          subtitle={isAdminOrEmperor ? "Total system tasks" : "Assigned to you"}
        />
        <StatCard 
          title="Ongoing" 
          value={stats?.tasks?.ongoing || 0} 
          icon={Clock} 
          color="bg-amber-500 text-amber-500"
          subtitle="Actively in progress"
        />
        <StatCard 
          title="Completed" 
          value={stats?.tasks?.done || 0} 
          icon={CheckCircle2} 
          color="bg-emerald-500 text-emerald-500"
          subtitle="Tasks finalized"
        />
        {isAdminOrEmperor ? (
          <StatCard 
            title="Active Users" 
            value={stats?.users || 0} 
            icon={Users} 
            color="bg-purple-500 text-purple-500"
            subtitle="Personnel on platform"
          />
        ) : (
          <StatCard 
            title="On Hold" 
            value={stats?.tasks?.hold || 0} 
            icon={AlertCircle} 
            color="bg-red-500 text-red-500"
            subtitle="Waiting for action"
          />
        )}
      </div>

      {isAdminOrEmperor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Financial Summary */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <TrendingUp size={180} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                  <Wallet size={24} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Financial Health</h2>
                  <p className="text-slate-400 text-sm">System-wide budget tracking</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-2">Total Requested</p>
                  <div className="text-2xl font-black">{formatIDR(stats?.budgets?.totalRequested || 0)}</div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-2">Total Approved</p>
                  <div className="text-2xl font-black text-emerald-400">{formatIDR(stats?.budgets?.totalApproved || 0)}</div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-2">Actual Spent</p>
                  <div className="text-2xl font-black text-blue-400">{formatIDR(stats?.budgets?.totalSpent || 0)}</div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5">
                <Link to="/dashboard/budget" className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  Open Budget Management <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links / Shortcuts */}
          <div className="bg-[var(--color-bg-surface)] p-8 rounded-[2.5rem] border border-[var(--color-border-subtle)] shadow-sm">
             <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-6">Quick Navigation</h3>
             <div className="space-y-4">
                <Link to="/dashboard/tasks" className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg-body)] hover:bg-[var(--color-primary)]/5 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Layout size={18} /></div>
                    <span className="font-bold text-sm text-[var(--color-text-main)]">Task Management</span>
                  </div>
                  <ArrowRight size={16} className="text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform" />
                </Link>
                
                {user?.role === 'emperor' && (
                  <Link to="/dashboard/users" className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg-body)] hover:bg-[var(--color-primary)]/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Users size={18} /></div>
                      <span className="font-bold text-sm text-[var(--color-text-main)]">User Administration</span>
                    </div>
                    <ArrowRight size={16} className="text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                <div className="p-6 mt-4 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                   <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm mb-1">
                      <AlertCircle size={16} />
                      System Notice
                   </div>
                   <p className="text-xs text-amber-600/70 dark:text-amber-400/70 leading-relaxed font-medium">
                      Remember to verify actual costs with the uploaded receipts in the budget menu.
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold">
          {error}
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
