import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import api from '../../services/api';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    deadline: '',
    assigned_to: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        deadline: '',
        assigned_to: ''
      });
      setError('');
      
      // Fetch users for the assignee dropdown
      const fetchUsers = async () => {
        try {
          const res = await api.get('/tasks/users/list');
          if (res.data.success || res.data.status === 'success') {
            setUsers(res.data.data);
          }
        } catch (err) {
          console.error("Failed to fetch users", err);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      setError('Title and Category are required!');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // payload structuring
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
      };
      if (formData.deadline) payload.deadline = formData.deadline;
      if (formData.assigned_to) payload.assigned_to = formData.assigned_to;

      const res = await api.post('/tasks', payload);
      if (res.data.status === 'success') {
        onTaskCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4 relative">
        
        {/* Decorative blob inside modal limit */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-secondary)] rounded-full mix-blend-multiply opacity-5 blur-2xl pointer-events-none"></div>

        {error && (
          <div className="flex items-center p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/50">
            <AlertCircle size={16} className="mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Task Title *"
          name="title"
          placeholder="e.g. Repair Generator Room 2"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[var(--color-text-main)] block">Description</label>
          <textarea
            name="description"
            className="w-full bg-[var(--color-bg-main)] text-[var(--color-text-main)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all resize-y min-h-[100px]"
            placeholder="Detailed description of the issue or requirement..."
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[var(--color-text-main)] block">Category *</label>
            <select
              name="category"
              className="w-full bg-[var(--color-bg-main)] text-[var(--color-text-main)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all cursor-pointer capitalize appearance-none"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Category</option>
              <option value="teknik">Teknik</option>
              <option value="it">IT</option>
              <option value="engineering">Engineering</option>
              <option value="teknologi">Teknologi</option>
              <option value="lossprevention">Loss Prevention</option>
              <option value="infrastruktur">Infrastruktur</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-[var(--color-text-main)] block">Priority</label>
            <select
              name="priority"
              className="w-full bg-[var(--color-bg-main)] text-[var(--color-text-main)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all cursor-pointer capitalize appearance-none"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
          />

          <div className="space-y-1">
            <label className="text-sm font-semibold text-[var(--color-text-main)] block">Assign To (Optional)</label>
            <select
              name="assigned_to"
              className="w-full bg-[var(--color-bg-main)] text-[var(--color-text-main)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all cursor-pointer appearance-none"
              value={formData.assigned_to}
              onChange={handleChange}
            >
              <option value="">-- Select Assignee --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t border-[var(--color-border-subtle)] mt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto shadow-md">
            {loading ? <span className="animate-pulse">Creating...</span> : <><Check size={18} className="mr-2" /> Create Task</>}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
