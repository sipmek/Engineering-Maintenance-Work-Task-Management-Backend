import React, { useState, useEffect, useRef } from 'react';
import { Users as UsersIcon, Plus, Search, MoreVertical, Server, Wrench, Shield, Mail, AlertCircle, Trash2, CheckCircle, Edit, Key, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import api from '../services/api';

const RoleBadge = ({ role }) => {
  const styles = {
    emperor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
    admin: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20',
    user: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
  };

  const icons = {
    emperor: <Shield size={14} className="mr-1" />,
    admin: <Server size={14} className="mr-1" />,
    user: <Wrench size={14} className="mr-1" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[role] || styles['user']}`}>
      {icons[role] || icons['user']}
      {(role || 'user').toUpperCase()}
    </span>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Editing State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // Active Dropdown & Upload
  const [activeDropdown, setActiveDropdown] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadingUserId, setUploadingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/emperor/users');
      setUsers(response.data.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch users. Ensure you have Emperor access.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    
    try {
      await api.post('/emperor/users', formData);
      setIsModalOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'user' }); // Reset
      fetchUsers(); // Refresh the list
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    
    try {
      await api.put(`/emperor/users/${editFormData.id}`, {
        username: editFormData.username,
        email: editFormData.email,
        role: editFormData.role
      });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleBan = async (id) => {
    try { await api.patch(`/emperor/users/${id}/ban`); fetchUsers(); } 
    catch(err) { setError('Failed to ban user.'); }
  };

  const handleActivate = async (id) => {
    try { await api.patch(`/emperor/users/${id}/activate`); fetchUsers(); } 
    catch(err) { setError('Failed to activate user.'); }
  };

  const handleResetPassword = async (id) => {
    setActiveDropdown(null);
    const newPassword = prompt("Enter new password for this user (min 6 chars):");
    
    if (newPassword === null) return; // User clicked Cancel
    if (!newPassword || newPassword.trim().length < 6) {
      return alert("Password is too short (minimum 6 characters).");
    }
    
    try { 
      setIsLoading(true);
      const response = await api.patch(`/emperor/users/${id}/reset-password`, { 
        newPassword: newPassword.trim() 
      }); 
      alert(response.data?.message || "Password has been reset successfully."); 
    } 
    catch(err) { 
      const msg = err.response?.data?.message || 'Failed to reset password.';
      alert(msg);
      setError(msg); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !uploadingUserId) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setIsLoading(true);
      await api.patch(`/emperor/users/${uploadingUserId}/photo?type=avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setIsLoading(false);
      setUploadingUserId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredUsers = users.filter(u => 
    (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-sm">
        
        {/* Hidden File Input for Avatar */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleAvatarUpload}
        />
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl shadow-lg shadow-[var(--color-primary)]/20 text-white">
            <UsersIcon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-muted)]">
              Engineering Team
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Manage accounts, roles, and access control.
            </p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto shadow-md shadow-[var(--color-primary)]/20">
          <Plus size={20} className="mr-2" />
          Add Member
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Input 
            type="text" 
            placeholder="Search engineers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 bg-[var(--color-bg-surface)]"
          />
          <Search size={20} className="absolute left-4 top-[14px] text-[var(--color-text-muted)]" />
        </div>
        <div className="text-sm text-[var(--color-text-muted)] font-medium">
          Total: {filteredUsers.length} members
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center shadow-sm">
          <AlertCircle size={20} className="mr-3" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : (
        /* Users Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div 
              key={user.id} 
              className={`bg-[var(--color-bg-surface)] rounded-2xl p-6 border border-[var(--color-border-subtle)] hover:shadow-lg transition-all duration-300 group relative ${user.status === 'banned' ? 'opacity-60 saturate-50' : ''}`}
            >
              <button 
                onClick={() => toggleDropdown(user.id)}
                className="absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-border-subtle)] rounded-full transition-all"
              >
                <MoreVertical size={18} />
              </button>

              {/* Actions Dropdown */}
              {activeDropdown === user.id && (
                <div className="absolute top-12 right-4 bg-[var(--color-bg-main)] border border-[var(--color-border-subtle)] shadow-xl rounded-xl w-48 py-2 z-20 animate-fade-in">
                  <button onClick={() => { setEditFormData(user); setIsEditModalOpen(true); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-bg-surface)] flex items-center">
                    <Edit size={14} className="mr-2" /> Edit Details
                  </button>
                  <button onClick={() => { handleResetPassword(user.id); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-bg-surface)] flex items-center">
                    <Key size={14} className="mr-2" /> Reset Password
                  </button>
                  <button onClick={() => { setUploadingUserId(user.id); setActiveDropdown(null); fileInputRef.current?.click(); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-bg-surface)] flex items-center text-blue-500">
                    <ImageIcon size={14} className="mr-2" /> Upload Avatar
                  </button>
                  {user.status !== 'banned' ? (
                    <button onClick={() => { handleBan(user.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center">
                      <Trash2 size={14} className="mr-2" /> Ban User
                    </button>
                  ) : (
                    <button onClick={() => { handleActivate(user.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-emerald-500 hover:bg-emerald-500/10 flex items-center">
                      <CheckCircle size={14} className="mr-2" /> Activate User
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-bold text-lg shadow-inner overflow-hidden border-2 border-[var(--color-border-subtle)]">
                  {user.photo ? (
                    <img src={`http://localhost:5000/${user.photo}`} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-600 dark:text-gray-300 uppercase">{(user.username || 'U').charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-[var(--color-text-main)] truncate">{user.username}</h3>
                    {user.status === 'banned' && <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Banned</span>}
                  </div>
                  <div className="flex items-center text-sm text-[var(--color-text-muted)] truncate mt-0.5">
                    <Mail size={14} className="mr-1.5 shrink-0" />
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text-muted)] flex items-center">
                  <Wrench size={14} className="mr-1.5 opacity-70" /> Engineering
                </span>
                <RoleBadge role={user.role} />
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && !error && (
            <div className="col-span-full text-center py-10 text-[var(--color-text-muted)]">
              No engineers found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add New Member"
      >
        <form onSubmit={handleAddUser} className="space-y-5 mt-2">
          {formError && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm flex items-center shadow-sm">
              <AlertCircle size={16} className="mr-2 shrink-0" />
              {formError}
            </div>
          )}
          <Input 
            label="Username" 
            type="text" 
            required 
            placeholder="e.g. johndoe"
            value={formData.username}
            onChange={e => setFormData({...formData, username: e.target.value})}
          />
          <Input 
            label="Email Address" 
            type="email" 
            required 
            placeholder="engineering@mtms.com"
            value={formData.email || ''}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <Input 
            label="Temporary Password" 
            type="password" 
            required 
            placeholder="••••••••"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-main)] ml-1">
              Role / Access Level
            </label>
            <select 
              className="flex h-12 w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-body)] px-4 py-2 text-base transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-main)]"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">User (Engineer/Machinist)</option>
              <option value="admin">Admin (Lead/Supervisor)</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {editFormData && (
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Member Access"
        >
          <form onSubmit={handleEditUser} className="space-y-5 mt-2">
            {formError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm flex items-center shadow-sm">
                <AlertCircle size={16} className="mr-2 shrink-0" />
                {formError}
              </div>
            )}
            <Input 
              label="Username" 
              type="text" 
              required 
              value={editFormData.username}
              onChange={e => setEditFormData({...editFormData, username: e.target.value})}
            />
            <Input 
              label="Email Address" 
              type="email" 
              required 
              placeholder="Enter user email..."
              value={editFormData.email || ''}
              onChange={e => setEditFormData({...editFormData, email: e.target.value})}
            />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text-main)] ml-1">
                Role / Access Level
              </label>
              <select 
                className="flex h-12 w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-body)] px-4 py-2 text-base transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-main)]"
                value={editFormData.role || 'user'}
                onChange={e => setEditFormData({...editFormData, role: e.target.value})}
              >
                <option value="user">User (Engineer/Machinist)</option>
                <option value="admin">Admin (Lead/Supervisor)</option>
              </select>
            </div>

            <div className="pt-4 flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default Users;
