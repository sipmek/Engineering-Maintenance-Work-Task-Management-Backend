import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, MessageSquare, Tag, FileText, Send, User, ChevronRight, AlertCircle, CheckCircle, PauseCircle, Paperclip, Image as ImageIcon, ExternalLink, Maximize2, UserPlus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getFullUrl } from '../../utils/url';
import { useAuth } from '../../context/AuthContext';

const TaskDetailModal = ({ isOpen, onClose, taskId, onTaskUpdated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Activity state
  const [commentText, setCommentText] = useState('');
  const [statusUpdate, setStatusUpdate] = useState(''); // ongoing, hold, done
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  // Members state
  const [members, setMembers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  
  // Edit Task State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    deadline: '',
    assigned_to: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Edit Activity State
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editActivityText, setEditActivityText] = useState('');
  const [activitySubmitting, setActivitySubmitting] = useState(false);

  const scrollRef = useRef(null);

  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/tasks/${taskId}`);
      setTask(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}/members`);
      setMembers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  const fetchUsersList = async () => {
    try {
      const res = await api.get('/tasks/users/list');
      setUsersList(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetail();
      fetchMembers();
      fetchUsersList();
      setStatusUpdate('');
      setCommentText('');
      setShowAddMember(false);
      setSelectedUserId('');
      setIsEditing(false);
    }
  }, [isOpen, taskId]);

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    const selectedUser = usersList.find(u => Number(u.id) === Number(selectedUserId));
    if (!selectedUser) return;

    if (!window.confirm(`Tambahkan ${selectedUser.username} sebagai member ke task ini?`)) return;
    try {
      setMemberLoading(true);
      await api.post(`/tasks/${taskId}/members`, { user_id: selectedUser.id });
      setShowAddMember(false);
      setSelectedUserId('');
      fetchMembers();
      fetchTaskDetail(); // Refresh timeline for new log
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await api.delete(`/tasks/${taskId}/members/${userId}`);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleEditClick = () => {
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      category: task.category || '',
      priority: task.priority || '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
      assigned_to: task.assigned_to || ''
    });
    setIsEditing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditSubmitting(true);
      await api.put(`/tasks/${taskId}`, editForm);
      setIsEditing(false);
      fetchTaskDetail();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      if (onTaskUpdated) onTaskUpdated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleEditActivityClick = (act) => {
    setEditingActivityId(act.id);
    setEditActivityText(act.message || '');
  };

  const handleEditActivitySubmit = async (activityId, e) => {
    e.preventDefault();
    try {
      setActivitySubmitting(true);
      await api.put(`/tasks/${taskId}/activities/${activityId}`, { message: editActivityText });
      setEditingActivityId(null);
      fetchTaskDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update activity');
    } finally {
      setActivitySubmitting(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm("Delete this activity record?")) return;
    try {
      await api.delete(`/tasks/${taskId}/activities/${activityId}`);
      fetchTaskDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete activity');
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [task?.TaskActivities]);

  const handlePostActivity = async (e) => {
    e.preventDefault();
    if (!commentText && !statusUpdate) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      // If changing status, we might want to post two things or handle gracefully
      // The backend accepts `status_update` and `message` in the same endpoint
      const formData = new FormData();
      formData.append('type', statusUpdate ? 'status_update' : (attachment ? 'attachment' : 'comment'));
      if (commentText) formData.append('message', commentText);
      if (statusUpdate) formData.append('status_update', statusUpdate);
      if (attachment) formData.append('file', attachment);

      await api.post(`/tasks/${taskId}/activities`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Refresh timeline
      setCommentText('');
      setStatusUpdate('');
      setAttachment(null);
      fetchTaskDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-5xl h-full max-h-[95vh] bg-[var(--color-bg-body)] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-[var(--color-border-subtle)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Actions */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          {(user?.role === 'emperor' || user?.role === 'admin' || task?.created_by === user?.id) && task && (
            <>
              <button 
                onClick={handleEditClick}
                className="p-2 text-[var(--color-text-muted)] hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-all"
                title="Edit Task"
              >
                <Edit2 size={20} />
              </button>
              <button 
                onClick={handleDeleteTask}
                className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                title="Delete Task"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
          <button 
            onClick={() => navigate(`/dashboard/tasks/${taskId}/report`)}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-full transition-all group"
            title="Full Report View"
          >
            <Maximize2 size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {loading && !task ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-[var(--color-primary)]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[var(--color-primary)] rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : error && !task ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-red-50/50">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-red-700">Access Denied / Error</h3>
            <p className="text-red-600/80 mt-2 max-w-md">{error}</p>
            <Button onClick={onClose} className="mt-6">Close</Button>
          </div>
        ) : task ? (
          <>
            {/* Left Column: Task Details */}
            <div className="w-full md:w-5/12 lg:w-1/3 bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)] flex flex-col overflow-y-auto">
              <div className="p-6 lg:p-8">
                <button 
                  onClick={onClose}
                  className="hidden md:flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors mb-6 font-medium text-sm"
                >
                  <ChevronRight size={18} className="mr-1 rotate-180" /> Back to Dashboard
                </button>

                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="space-y-4 animate-fade-in">
                    <h3 className="font-bold text-lg mb-4">Edit Task</h3>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Title</label>
                      <input 
                        required
                        className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border-subtle)] rounded-lg p-2.5 text-sm"
                        value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Description</label>
                      <textarea 
                        className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border-subtle)] rounded-lg p-2.5 text-sm h-24 resize-y"
                        value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Category</label>
                        <select 
                          className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border-subtle)] rounded-lg p-2.5 text-sm"
                          value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}
                        >
                          <option value="teknik">Teknik</option>
                          <option value="it">IT</option>
                          <option value="engineering">Engineering</option>
                          <option value="teknologi">Teknologi</option>
                          <option value="lossprevention">Loss Prevention</option>
                          <option value="infrastruktur">Infrastruktur</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Priority</label>
                        <select 
                          className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border-subtle)] rounded-lg p-2.5 text-sm"
                          value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Assignee</label>
                      <select 
                        className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border-subtle)] rounded-lg p-2.5 text-sm"
                        value={editForm.assigned_to} onChange={e => setEditForm({...editForm, assigned_to: e.target.value})}
                      >
                        <option value="">Unassigned</option>
                        {usersList.map(u => (
                          <option key={u.id} value={u.id}>{u.username}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Deadline</label>
                      <input 
                        type="date"
                        className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border-subtle)] rounded-lg p-2.5 text-sm"
                        value={editForm.deadline} onChange={e => setEditForm({...editForm, deadline: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button type="submit" disabled={editSubmitting}>{editSubmitting ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center ${
                    task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    task.status === 'ongoing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    task.status === 'hold' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    'bg-gray-500/10 text-gray-500 border-gray-500/20'
                  }`}>
                    {task.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border border-[var(--color-border-subtle)] bg-[var(--color-bg-main)] text-[var(--color-text-muted)]">
                    {task.category}
                  </span>
                  {task.priority && (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border border-[var(--color-border-subtle)] bg-[var(--color-bg-main)] text-[var(--color-primary)]">
                      {task.priority} Priority
                    </span>
                  )}
                </div>

                <h2 className="text-xl lg:text-2xl font-bold text-[var(--color-text-main)] mb-4 leading-tight">
                  {task.title}
                </h2>

                <div className="grid grid-cols-2 gap-4 bg-[var(--color-bg-main)] p-4 rounded-2xl border border-[var(--color-border-subtle)] mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden shrink-0">
                      {task.creator?.photo ? (
                        <img src={getFullUrl(task.creator.photo)} alt={task.creator.username} className="w-full h-full object-cover" />
                      ) : (
                        task.creator?.username?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] uppercase text-[var(--color-text-muted)] font-bold tracking-wider leading-none mb-1">Creator</p>
                      <p className="text-xs font-semibold truncate max-w-[100px]">{task.creator?.username}</p>
                    </div>
                  </div>

                  {task.assignee && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden shrink-0">
                        {task.assignee.photo ? (
                          <img src={getFullUrl(task.assignee.photo)} alt={task.assignee.username} className="w-full h-full object-cover" />
                        ) : (
                          task.assignee.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-[9px] uppercase text-[var(--color-text-muted)] font-bold tracking-wider leading-none mb-1">Assignee</p>
                        <p className="text-xs font-semibold truncate max-w-[100px]">{task.assignee.username}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 text-[var(--color-text-main)]">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center border border-[var(--color-border-subtle)] shrink-0">
                      <Calendar size={12} className="text-[var(--color-text-muted)]" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase text-[var(--color-text-muted)] font-bold tracking-wider leading-none mb-1">Created</p>
                      <p className="text-xs font-semibold">{new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {task.deadline && (
                    <div className="flex items-center gap-2.5 text-rose-500">
                      <div className="w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
                        <Clock size={12} />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold tracking-wider leading-none mb-1 text-rose-400">Deadline</p>
                        <p className="text-xs font-semibold">{new Date(task.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>

                  {/* Task Members Section */}
                  <div className="pt-4 mt-2 border-t border-[var(--color-border-subtle)]">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold tracking-wider flex items-center gap-1">
                        <UserPlus size={12} /> Task Members
                      </p>
                      {(user?.role === 'emperor' || user?.role === 'admin' || task.created_by === user?.id) && (
                        <button
                          onClick={() => setShowAddMember(!showAddMember)}
                          className="text-[10px] font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 px-2 py-1 rounded"
                        >
                          {showAddMember ? 'Cancel' : '+ Add Member'}
                        </button>
                      )}
                    </div>
                    
                    {showAddMember && (
                      <div className="flex gap-2 mb-3 items-center">
                        <select 
                          className="flex-1 bg-[var(--color-bg-surface)] text-sm border border-[var(--color-border-subtle)] p-1.5 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                          <option value="">Select User...</option>
                          {usersList
                            .filter(u => u.id !== task.created_by && u.id !== task.assignee_id && !members.some(m => m.user_id === u.id))
                            .map(u => (
                            <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                          ))}
                        </select>
                        <Button size="sm" onClick={handleAddMember} disabled={!selectedUserId || memberLoading} className="py-1.5 px-3">
                          {memberLoading ? '...' : 'Add'}
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {members.length === 0 ? (
                        <span className="text-xs text-[var(--color-text-muted)] italic">No additional members</span>
                      ) : (
                        members.map(member => (
                          <div key={member.id} className="relative group inline-flex items-center gap-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] px-2 py-1 rounded-full pr-3">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200">
                              {member.User?.photo ? (
                                <img src={getFullUrl(member.User.photo)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-100">
                                  {member.User?.username?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-medium">{member.User?.username}</span>
                            
                            {(user?.role === 'emperor' || user?.role === 'admin' || task.created_by === user?.id) && (
                              <button 
                                onClick={() => handleRemoveMember(member.user_id)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove member"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                <div className="mt-6">
                  <h4 className="text-xs font-bold text-[var(--color-text-main)] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText size={14} /> Description
                  </h4>
                  <p className="text-[var(--color-text-main)] text-sm leading-relaxed whitespace-pre-line opacity-90">
                    {task.description}
                  </p>
                </div>
                </>
                )}
              </div>
            </div>

            {/* Right Column: Activity / Timeline */}
            <div className="w-full md:w-7/12 lg:w-2/3 flex flex-col h-[60vh] md:h-full bg-[var(--color-bg-body)] relative">
              
              <div className="p-4 md:p-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex items-center justify-between z-10">
                <h3 className="text-lg font-bold flex items-center">
                  <MessageSquare size={18} className="mr-2 text-[var(--color-primary)]" />
                  Activity Timeline
                </h3>
              </div>

              {/* Timeline Scroll Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-gradient-to-b from-transparent to-[var(--color-bg-surface)]/30">
                {task.TaskActivities?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-50">
                    <MessageSquare size={48} className="mb-4 text-[var(--color-text-muted)]" />
                    <p>No activity recorded yet.</p>
                  </div>
                ) : (
                  task.TaskActivities?.map((activity, index) => {
                    // Check if this is an auto-generated system log
                    const isSystem = activity.type === 'status_update' || activity.type === 'system' ||
                      (activity.message && (
                        activity.message.startsWith('Task dibuat oleh') || 
                        activity.message.startsWith('Task diedit oleh') ||
                        activity.message.startsWith('Komentar/Aktivitas sebelumnya telah diedit') ||
                        activity.message.startsWith('System:')
                      ));

                    // ======================================
                    // RENDER COMPACT SYSTEM LOG
                    // ======================================
                    if (isSystem) {
                      return (
                        <div key={activity.id} className="flex justify-center items-center my-4 group relative">
                          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)] shadow-sm max-w-[90%] text-center">
                            <AlertCircle size={14} className="text-[var(--color-primary)] opacity-70 shrink-0" />
                            <span className="truncate">
                              {activity.message || `Status changed to: ${activity.status_update}`}
                            </span>
                            <span className="opacity-50 shrink-0 ml-1 whitespace-nowrap">
                              • {new Date(activity.createdAt).toLocaleString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})}
                            </span>
                          </div>
                          
                          {/* Allow Admin/Emperor/Creator to delete system logs just in case */}
                          {(user?.role === 'emperor' || user?.role === 'admin' || activity.user_id === user?.id) && (
                              <button 
                                onClick={() => handleDeleteActivity(activity.id)}
                                className="absolute -right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-[var(--color-text-muted)] hover:text-red-500 rounded-full hover:bg-red-50" 
                                title="Hide System Log"
                              >
                                <X size={14} />
                              </button>
                          )}
                        </div>
                      );
                    }

                    // ======================================
                    // RENDER NORMAL ACTIVITY BUBBLE
                    // ======================================
                    return (
                    <div key={activity.id} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-subtle)] flex items-center justify-center shrink-0 z-10 shadow-sm overflow-hidden">
                          {activity.User?.photo ? (
                            <img 
                              src={getFullUrl(activity.User.photo)} 
                              alt={activity.User.username}
                              className="w-full h-full object-cover"
                            />
                          ) : activity.type === 'budget_request' ? (
                            <FileText size={16} className="text-amber-500" />
                          ) : (
                            <User size={16} className="text-text-muted" />
                          )}
                        </div>
                        {index !== task.TaskActivities.length - 1 && (
                          <div className="w-0.5 bg-[var(--color-border-subtle)] flex-1 my-1"></div>
                        )}
                      </div>
                      
                      <div className="bg-[var(--color-bg-surface)] p-4 rounded-2xl border border-[var(--color-border-subtle)] shadow-sm flex-1 mb-2 group-hover:border-[var(--color-primary)]/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold text-sm text-[var(--color-text-main)]">
                              {activity.User?.username || 'System'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--color-text-muted)] font-medium">
                              {new Date(activity.createdAt).toLocaleString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})}
                            </span>
                            {(user?.role === 'emperor' || user?.role === 'admin' || activity.user_id === user?.id) && (
                              <div className="flex opacity-0 group-hover:opacity-100 transition-opacity items-center gap-1">
                                <button 
                                  onClick={() => handleEditActivityClick(activity)}
                                  className="text-[var(--color-text-muted)] hover:text-blue-500" title="Edit Activity"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteActivity(activity.id)}
                                  className="text-[var(--color-text-muted)] hover:text-red-500" title="Delete Activity"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {editingActivityId === activity.id ? (
                          <form onSubmit={(e) => handleEditActivitySubmit(activity.id, e)} className="mt-2">
                            <textarea
                              className="w-full bg-[var(--color-bg-main)] text-sm border border-[var(--color-primary)] rounded-lg p-2 resize-y focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                              value={editActivityText}
                              onChange={(e) => setEditActivityText(e.target.value)}
                              autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <Button type="button" size="sm" variant="outline" onClick={() => setEditingActivityId(null)}>Cancel</Button>
                              <Button type="submit" size="sm" disabled={activitySubmitting}>{activitySubmitting ? 'Saving...' : 'Save'}</Button>
                            </div>
                          </form>
                        ) : activity.message && (
                          <p className="text-sm text-[var(--color-text-main)] opacity-90 leading-relaxed whitespace-pre-wrap">
                            {activity.message}
                          </p>
                        )}
                        
                        {activity.amount && (
                          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <p className="text-xs font-bold text-amber-600 uppercase">Budget Requested</p>
                            <p className="text-lg font-black text-amber-500">Rp {parseInt(activity.amount).toLocaleString('id-ID')}</p>
                          </div>
                        )}

                        {activity.file_url && (
                          <div className="mt-3 rounded-xl border border-[var(--color-border-subtle)] overflow-hidden bg-[var(--color-bg-main)]">
                            {activity.file_type === 'image' ? (
                              <div className="flex flex-col">
                                <img 
                                  src={getFullUrl(activity.file_url)} 
                                  alt="Attachment" 
                                  className="max-h-60 object-contain bg-black/5"
                                />
                                <div className="p-2 border-t border-[var(--color-border-subtle)] flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Image Attachment</span>
                                  <a href={getFullUrl(activity.file_url)} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] text-xs font-bold flex items-center hover:underline">
                                    View Full <ExternalLink size={10} className="ml-1" />
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <a 
                                href={getFullUrl(activity.file_url)} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center p-3 gap-3 hover:bg-[var(--color-primary)]/5 transition-colors"
                              >
                                <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
                                  <FileText size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[var(--color-text-main)] truncate">Document Attachment</p>
                                  <p className="text-[10px] text-[var(--color-text-muted)]">Click to open file</p>
                                </div>
                                <ExternalLink size={14} className="text-[var(--color-text-muted)]" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )})
                )}
              </div>

              {/* Activity Input Area */}
              <div className="p-4 md:p-6 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-subtle)] z-10">
                {error && <p className="text-red-500 text-sm mb-3 font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
                
                <form onSubmit={handlePostActivity} className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    {statusUpdate && (
                      <div className="absolute -top-8 left-0 right-0 flex justify-between items-center text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-t-lg border border-[var(--color-primary)]/20 border-b-0">
                        Will change status to: {statusUpdate.toUpperCase()}
                        <button type="button" onClick={() => setStatusUpdate('')} className="hover:text-red-500"><X size={14}/></button>
                      </div>
                    )}
                    {attachment && (
                      <div className="absolute -top-12 left-0 right-0 flex justify-between items-center text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-2 rounded-t-lg border border-emerald-500/20 border-b-0">
                        <div className="flex items-center gap-2 truncate pr-4">
                          <Paperclip size={12} />
                          <span className="truncate">{attachment.name}</span>
                        </div>
                        <button type="button" onClick={() => setAttachment(null)} className="hover:text-red-500 shrink-0"><X size={14}/></button>
                      </div>
                    )}
                    <textarea 
                      placeholder={attachment ? "Add a caption for your file..." : "Add an update or comment..."}
                      className={`w-full bg-[var(--color-bg-main)] text-[var(--color-text-main)] border border-[var(--color-border-subtle)] focus:border-[var(--color-primary)] rounded-xl lg:rounded-2xl px-4 py-3 min-h-[50px] max-h-[150px] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all ${(statusUpdate || attachment) ? 'rounded-tl-none border-t-0' : ''}`}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handlePostActivity(e);
                        }
                      }}
                    />
                    <div className="absolute right-3 bottom-3 flex gap-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={(e) => setAttachment(e.target.files[0])}
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded-md hover:bg-[var(--color-bg-surface)]"
                        title="Attach File"
                      >
                        <Paperclip size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Optional Status dropdown trigger */}
                  {!statusUpdate && (
                    <select 
                      className="bg-[var(--color-bg-main)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] rounded-xl py-3 px-2 text-sm focus:outline-none hover:border-[var(--color-primary)] cursor-pointer"
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      title="Update Task Status"
                      value=""
                    >
                      <option value="" disabled>Status...</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="hold">Hold</option>
                      <option value="done">Done</option>
                    </select>
                  )}

                  <Button type="submit" disabled={isSubmitting || (!commentText.trim() && !statusUpdate)} className="rounded-xl px-4 py-3 shrink-0 group shadow-md shadow-[var(--color-primary)]/20">
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                  </Button>
                </form>
              </div>

            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TaskDetailModal;
