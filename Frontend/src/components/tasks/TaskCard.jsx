import React from 'react';
import { Calendar, MessageSquare, Paperclip, AlertCircle, CheckCircle, Clock, PauseCircle, ChevronRight } from 'lucide-react';
import { getFullUrl } from '../../utils/url';

const TaskCard = ({ task, viewMode, onClick }) => {
  // Utility for status colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'done': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'ongoing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'hold': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'done': return <CheckCircle size={14} className="mr-1" />;
      case 'ongoing': return <Clock size={14} className="mr-1" />;
      case 'hold': return <PauseCircle size={14} className="mr-1" />;
      default: return <AlertCircle size={14} className="mr-1" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-rose-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-[var(--color-text-muted)]';
    }
  };

  const formattedDate = new Date(task.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => onClick(task)}
        className="group bg-[var(--color-bg-surface)] p-4 rounded-2xl border border-[var(--color-border-subtle)] shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/50 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(task.status)} flex items-center`}>
              {getStatusIcon(task.status)}
              {task.status}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] px-2 rounded-md bg-[var(--color-bg-main)] uppercase tracking-wider">
              {task.category}
            </span>
            {task.priority && (
              <span className={`text-xs font-bold uppercase ${getPriorityColor(task.priority)} flex items-center`}>
                <span className={`w-2 h-2 rounded-full mr-1 ${getPriorityColor(task.priority).replace('text-', 'bg-')}`}></span>
                {task.priority}
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg text-[var(--color-text-main)] truncate group-hover:text-[var(--color-primary)] transition-colors">
            {task.title}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] truncate max-w-2xl mt-1">
            {task.description}
          </p>
        </div>

        <div className="flex items-center gap-6 sm:shrink-0">
          <div className="flex items-center text-[var(--color-text-muted)] text-xs font-medium">
            <Calendar size={14} className="mr-1.5" />
            {formattedDate}
          </div>
          
          {/* Real Avatars for assignee/creator */}
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-[var(--color-bg-surface)] z-10 overflow-hidden" title={`Creator: ${task.creator?.username}`}>
              {task.creator?.photo ? (
                <img src={getFullUrl(task.creator.photo)} alt={task.creator.username} className="w-full h-full object-cover" />
              ) : (
                task.creator?.username?.charAt(0).toUpperCase() || '?'
              )}
            </div>
            {task.assignee && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-[var(--color-bg-surface)] z-0 overflow-hidden" title={`Assignee: ${task.assignee.username}`}>
                {task.assignee.photo ? (
                  <img src={getFullUrl(task.assignee.photo)} alt={task.assignee.username} className="w-full h-full object-cover" />
                ) : (
                  task.assignee.username.charAt(0).toUpperCase()
                )}
              </div>
            )}
          </div>

          <ChevronRight size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div 
      onClick={() => onClick(task)}
      className="group bg-[var(--color-bg-surface)] p-5 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] rounded-full mix-blend-multiply opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500"></div>

      <div className="flex justify-between items-start mb-4">
        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border ${getStatusColor(task.status)} flex items-center`}>
          {getStatusIcon(task.status)}
          {task.status}
        </span>
        <div className="flex gap-2 text-[var(--color-text-muted)] pointer-events-none">
          {/* Mock metrics until we fetch activities count natively */}
          <div className="flex items-center text-xs font-medium bg-[var(--color-bg-main)] px-2 py-1 rounded-md border border-[var(--color-border-subtle)]">
            <MessageSquare size={12} className="mr-1" /> ?
          </div>
        </div>
      </div>

      <h3 className="font-bold text-lg text-[var(--color-text-main)] line-clamp-2 leading-tight mb-2 group-hover:text-[var(--color-primary)] transition-colors">
        {task.title}
      </h3>
      
      <p className="text-sm text-[var(--color-text-muted)] line-clamp-3 mb-6 flex-1">
        {task.description}
      </p>

      <div className="mt-auto pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Creator Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-transparent group-hover:ring-[var(--color-bg-main)] transition-all overflow-hidden">
            {task.creator?.photo ? (
              <img src={getFullUrl(task.creator.photo)} alt={task.creator.username} className="w-full h-full object-cover" />
            ) : (
              task.creator?.username?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--color-text-main)] truncate max-w-[80px]">
              {task.creator?.username || 'Unknown'}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] truncate capitalize max-w-[80px]">
              {task.category}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          {task.priority && (
             <span className={`text-[10px] font-bold uppercase mb-0.5 ${getPriorityColor(task.priority)} flex items-center`}>
               <span className={`w-1.5 h-1.5 rounded-full mr-1 ${getPriorityColor(task.priority).replace('text-', 'bg-')}`}></span>
               {task.priority}
             </span>
          )}
          <div className="flex items-center text-[var(--color-text-muted)] text-[11px] font-medium bg-[var(--color-bg-main)] px-2 py-0.5 rounded-md">
            <Calendar size={10} className="mr-1" />
            {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
