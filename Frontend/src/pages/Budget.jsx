import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  PieChart, 
  Banknote, 
  Receipt,
  MoreVertical,
  ArrowRight,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  const icons = {
    pending: <Clock size={12} className="mr-1.5" />,
    approved: <CheckCircle2 size={12} className="mr-1.5" />,
    rejected: <XCircle size={12} className="mr-1.5" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Budget = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Settlement State
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [actualCost, setActualCost] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdminOrEmperor = ['admin', 'emperor'].includes(user?.role);

  const fetchBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      // If imperial access, get all. Else, this logic might need a dedicated user-budget endpoint, 
      // but for now we follow the plan to use the master list if admin, or we might need task-based fetch.
      // For this master page, we use the global endpoint for admins.
      const endpoint = isAdminOrEmperor ? '/budgets' : '/budgets/me'; // Fallback if we add 'me' later
      // Assuming for now developers get a subset or just empty if not admin in the global list
      const response = await api.get('/budgets');
      setBudgets(response.data || []);
    } catch (err) {
      setError('Failed to load budget data. ' + (err.response?.data?.message || ''));
    } finally {
      setIsLoading(false);
    }
  }, [isAdminOrEmperor]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleAction = async (id, action, payload = {}) => {
    try {
      setIsLoading(true);
      await api.patch(`/budget/${id}/${action}`, payload);
      fetchBudgets();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} budget`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettlement = async (e) => {
    e.preventDefault();
    if (!receiptFile) return alert('Please upload a receipt photo');
    
    const formData = new FormData();
    formData.append('receipt', receiptFile);
    formData.append('actual_cost', actualCost);

    try {
      setIsSubmitting(true);
      await api.patch(`/budget/${selectedBudget.id}/actual-cost`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsSettlementModalOpen(false);
      setSelectedBudget(null);
      setActualCost('');
      setReceiptFile(null);
      fetchBudgets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit settlement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    totalRequested: budgets.reduce((acc, b) => acc + Number(b.estimated_cost), 0),
    totalApproved: budgets.filter(b => b.status === 'approved').reduce((acc, b) => acc + Number(b.estimated_cost), 0),
    totalSpent: budgets.reduce((acc, b) => acc + Number(b.actual_cost || 0), 0),
  };

  const filteredBudgets = budgets.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.Task?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-6 rounded-3xl text-white shadow-xl shadow-[var(--color-primary)]/20 flex flex-col justify-between">
          <div>
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4">
              <Wallet size={24} />
            </div>
            <h2 className="text-xl font-bold">Capital Overview</h2>
            <p className="text-white/70 text-sm mt-1">Financial tracking across all tasks</p>
          </div>
          <div className="mt-8">
            <span className="text-xs uppercase font-bold tracking-wider text-white/60">Total Budget Requested</span>
            <div className="text-3xl font-black mt-1">{formatIDR(stats.totalRequested)}</div>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[var(--color-bg-surface)] p-6 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <Banknote size={20} />
              </div>
              <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">Pending</span>
            </div>
            <div className="text-sm text-[var(--color-text-muted)] font-medium underline decoration-amber-500/30 underline-offset-4 decoration-2">Requested Flow</div>
            <div className="text-2xl font-bold text-[var(--color-text-main)] mt-2">{formatIDR(stats.totalRequested - stats.totalApproved)}</div>
          </div>

          <div className="bg-[var(--color-bg-surface)] p-6 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">Approved</span>
            </div>
            <div className="text-sm text-[var(--color-text-muted)] font-medium underline decoration-emerald-500/30 underline-offset-4 decoration-2">Allocated Funds</div>
            <div className="text-2xl font-bold text-[var(--color-text-main)] mt-2">{formatIDR(stats.totalApproved)}</div>
          </div>

          <div className="bg-[var(--color-bg-surface)] p-6 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Receipt size={20} />
              </div>
              <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">Spent</span>
            </div>
            <div className="text-sm text-[var(--color-text-muted)] font-medium underline decoration-blue-500/30 underline-offset-4 decoration-2">Realized Cost</div>
            <div className="text-2xl font-bold text-[var(--color-text-main)] mt-2">{formatIDR(stats.totalSpent)}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:row justify-between gap-4 bg-[var(--color-bg-surface)] p-4 rounded-2xl border border-[var(--color-border-subtle)]">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" size={18} />
              <input 
                type="text" 
                placeholder="Search by title or task..." 
                className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-body)] border border-[var(--color-border-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 bg-[var(--color-bg-body)] border border-[var(--color-border-subtle)] rounded-xl outline-none text-sm min-w-[140px]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
      </div>

      {/* Main Content */}
      <div className="bg-[var(--color-bg-surface)] rounded-3xl border border-[var(--color-border-subtle)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg-body)]/50 text-[var(--color-text-muted)] text-xs uppercase tracking-widest border-b border-[var(--color-border-subtle)]">
                <th className="px-6 py-4 font-bold">Item Detail</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold">Task Reference</th>
                <th className="px-6 py-4 font-bold">Estimated Cost</th>
                <th className="px-6 py-4 font-bold">Actual Cost</th>
                <th className="px-6 py-4 font-bold text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {filteredBudgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-[var(--color-text-main)]">{budget.title}</div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1">by {budget.requester?.username}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <StatusBadge status={budget.status} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 group-hover:text-[var(--color-primary)] transition-colors cursor-default">
                      <span className="text-sm font-medium text-[var(--color-text-muted)] max-w-[150px] truncate">{budget.Task?.title}</span>
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-[var(--color-text-main)]">{formatIDR(budget.estimated_cost)}</div>
                  </td>
                  <td className="px-6 py-5">
                    {budget.actual_cost ? (
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(budget.actual_cost)}</div>
                    ) : (
                      <span className="text-xs text-[var(--color-text-muted)] italic">Not spent yet</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right pr-6">
                    <div className="flex justify-end gap-2">
                       {isAdminOrEmperor && budget.status === 'pending' && (
                         <>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-emerald-500 h-9 px-3 rounded-lg hover:bg-emerald-500/10"
                              onClick={() => handleAction(budget.id, 'approve')}
                            >
                              <CheckCircle2 size={16} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-500 h-9 px-3 rounded-lg hover:bg-red-500/10"
                              onClick={() => {
                                const reason = prompt('Reason for rejection:');
                                if (reason !== null) handleAction(budget.id, 'reject', { reason });
                              }}
                            >
                              <XCircle size={16} />
                            </Button>
                         </>
                       )}
                       
                       {budget.status === 'approved' && !budget.actual_cost && (
                         <Button 
                           size="sm" 
                           className="h-9 px-4 rounded-xl shadow-lg shadow-[var(--color-primary)]/10"
                           onClick={() => {
                             setSelectedBudget(budget);
                             setActualCost(budget.estimated_cost);
                             setIsSettlementModalOpen(true);
                           }}
                         >
                           <Receipt size={16} className="mr-2" />
                           Settle
                         </Button>
                       )}
                       
                       {budget.receipt_photo && (
                         <a 
                           href={`http://localhost:5000/${budget.receipt_photo}`} 
                           target="_blank" 
                           rel="noreferrer"
                           className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                         >
                           <ArrowRight size={18} />
                         </a>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {isLoading && budgets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
              <p className="text-sm text-[var(--color-text-muted)]">Fetching financial data...</p>
            </div>
          )}

          {!isLoading && filteredBudgets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
              <div className="bg-[var(--color-bg-body)] p-4 rounded-full mb-4">
                <PieChart size={32} className="opacity-20" />
              </div>
              <p>No budget requests found matching these filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Settlement Modal */}
      <Modal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        title="Budget Settlement"
      >
        <form onSubmit={handleSettlement} className="space-y-5 mt-2">
          <div className="p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 rounded-2xl">
            <h4 className="font-bold text-[var(--color-text-main)] text-sm">{selectedBudget?.title}</h4>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">Est. Cost: {formatIDR(selectedBudget?.estimated_cost)}</div>
          </div>

          <Input 
            label="Actual Cost / Biaya Riil"
            type="number"
            placeholder="0"
            required
            value={actualCost}
            onChange={(e) => setActualCost(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text-main)] ml-1">Receipt Photo / Foto Nota</label>
            <div className="relative group">
               <input 
                type="file" 
                accept="image/*"
                required
                className="w-full text-sm text-[var(--color-text-muted)] 
                  file:mr-4 file:py-2.5 file:px-4 
                  file:rounded-xl file:border-0 
                  file:text-sm file:font-bold 
                  file:bg-[var(--color-primary)] file:text-white 
                  hover:file:bg-[var(--color-secondary)]
                  cursor-pointer transition-all box-border"
                onChange={(e) => setReceiptFile(e.target.files[0])}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <Button variant="ghost" type="button" onClick={() => setIsSettlementModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Confirm Settlement'}
            </Button>
          </div>
        </form>
      </Modal>

      {error && (
        <div className="fixed bottom-6 right-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center shadow-2xl animate-slide-up z-50">
          <AlertCircle size={20} className="text-red-500 mr-3 shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-600">×</button>
        </div>
      )}
    </div>
  );
};

export default Budget;
