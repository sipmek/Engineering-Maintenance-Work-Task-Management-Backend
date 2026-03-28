import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, User } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import TaskCard from '../components/tasks/TaskCard';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [myTasksOnly, setMyTasksOnly] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (myTasksOnly) params.append('mine', 'true');

      const response = await api.get(`/tasks?${params.toString()}`);
      // Standardized response is { status, message, data: { tasks: [], ... } }
      setTasks(response.data.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, categoryFilter, myTasksOnly]);

  const handleTaskClick = (task) => {
    setSelectedTaskId(task.id);
    setIsDetailModalOpen(true);
  };

  const handleTaskCreated = () => {
    fetchTasks(); // refresh data
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedTaskId(null);
    fetchTasks(); // Refresh tasks in case status changed within detail view
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative">

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        taskId={selectedTaskId}
      />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Maintenance Technical Infrastructure System & Loss Prevention </h1>
          <p className="text-[var(--color-text-muted)] mt-1">Manage and track engineering requests</p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 hover:-translate-y-1 transition-all rounded-2xl px-6 py-3 font-semibold group">
          <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Create Task
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--color-bg-surface)] p-4 rounded-2xl border border-[var(--color-border-subtle)] shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-primary)] rounded-full mix-blend-multiply opacity-5 blur-2xl"></div>

        <div className="flex flex-wrap gap-4 flex-1">
          <div className="relative w-full md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 !py-2 bg-[var(--color-bg-main)]"
            />
          </div>

          <div className="relative min-w-[140px]">
            <select
              className="w-full appearance-none bg-[var(--color-bg-main)] text-[var(--color-text-main)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all cursor-pointer font-medium text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="ongoing">Ongoing</option>
              <option value="hold">Hold</option>
              <option value="done">Done</option>
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          </div>

          <div className="relative min-w-[140px]">
            <select
              className="w-full appearance-none bg-[var(--color-bg-main)] text-[var(--color-text-main)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all cursor-pointer font-medium text-sm capitalize"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="teknik">Teknik</option>
              <option value="it">IT</option>
              <option value="engineering">Engineering</option>
              <option value="teknologi">Teknologi</option>
              <option value="lossprevention">Loss Prevention</option>
              <option value="infrastruktur">Infrastruktur</option>
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          </div>

          <button
            onClick={() => setMyTasksOnly(!myTasksOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-medium text-sm ${myTasksOnly
              ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)] shadow-sm'
              : 'bg-[var(--color-bg-main)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/50'
              }`}
          >
            <User size={16} />
            My Tasks
          </button>
        </div>

        <div className="hidden sm:flex bg-[var(--color-bg-main)] p-1 rounded-xl border border-[var(--color-border-subtle)] z-10">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-bg-surface)] shadow-sm text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[var(--color-bg-surface)] shadow-sm text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto rounded-3xl pb-20 pt-2 px-1">
        {loading ? (
          <div className="h-full min-h-[300px] flex items-center justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-[var(--color-primary)]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[var(--color-primary)] rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-[var(--color-bg-surface)]/50 rounded-3xl border border-dashed border-[var(--color-border-subtle)]">
            <div className="w-20 h-20 bg-[var(--color-bg-surface)] rounded-2xl shadow-lg flex items-center justify-center rotate-3 mb-4 border border-[var(--color-border-subtle)] text-[var(--color-primary)] animate-pulse">
              <List size={32} />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-main)]">No Tasks Found</h3>
            <p className="text-[var(--color-text-muted)] mt-2 text-center max-w-sm">
              We couldn't find any tasks matching your filters. Try adjusting your search or create a new task.
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} viewMode={viewMode} onClick={handleTaskClick} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Tasks;
