import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  PauseCircle,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { getFullUrl } from '../../utils/url';

const TaskReport = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTaskDetail();
  }, [taskId]);

  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/${taskId}`);
      setTask(res.data.data);
    } catch (err) {
      setError('Failed to load task report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'done': return { icon: <CheckCircle className="text-emerald-500" />, label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600' };
      case 'ongoing': return { icon: <Clock className="text-blue-500" />, label: 'On Progress', color: 'bg-blue-500/10 text-blue-600' };
      case 'hold': return { icon: <PauseCircle className="text-amber-500" />, label: 'On Hold', color: 'bg-amber-500/10 text-amber-600' };
      default: return { icon: <AlertCircle className="text-gray-500" />, label: status, color: 'bg-gray-500/10 text-gray-600' };
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-main)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
    </div>
  );

  if (error || !task) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg-main)] p-4 text-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Error Loading Report</h2>
      <p className="text-[var(--color-text-muted)] mb-6">{error || 'Task not found'}</p>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const statusInfo = getStatusInfo(task.status);
  const formattedDate = new Date(task.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 print:p-0 print:bg-white transition-colors duration-300">
      <style>{`
        @media print {
          @page {
            margin: 15mm;
            size: auto;
          }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-no-shadow {
            box-shadow: none !important;
          }
          .print-compact-p {
            padding: 0 !important;
          }
          .break-inside-avoid {
            break-inside: avoid-page;
            page-break-inside: avoid;
          }
        }
      `}</style>
      <div className="max-w-4xl mx-auto">

        {/* Actions - Hidden on Print */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors font-semibold group"
          >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-2">
              <Printer size={16} /> Print Report
            </Button>
          </div>
        </div>

        {/* The Report Document */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-200 print-no-shadow print:border-none print-compact-p print:w-full">

          {/* Report Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-6 mb-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-[var(--color-primary)] font-black text-xl mb-2 italic tracking-tighter">
                MTIS & LP <span className="text-gray-300 font-light not-italic">|</span> OFFICIAL REPORT
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-1 leading-tight uppercase tracking-tight">
                {task.title}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                  ID: #{task.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-center md:text-right">
              <p className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 tracking-widest">Date Generated</p>
              <p className="text-xs font-bold text-gray-900">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Core Metadata Grid - More Compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-50/30 p-4 rounded-2xl border border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                {task.creator?.photo ? (
                  <img src={getFullUrl(task.creator.photo)} alt="" className="w-full h-full object-cover" />
                ) : task.creator?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Creator</p>
                <p className="text-sm font-bold text-gray-800 leading-none">{task.creator?.username || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-y md:border-y-0 md:border-x border-gray-100 py-3 md:py-0 md:px-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500 overflow-hidden flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                {task.assignee?.photo ? (
                  <img src={getFullUrl(task.assignee.photo)} alt="" className="w-full h-full object-cover" />
                ) : (task.assignee?.username?.charAt(0).toUpperCase() || '?')}
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Assignee</p>
                <p className="text-sm font-bold text-gray-800 leading-none">{task.assignee?.username || 'Unassigned'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:pl-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-white shadow-sm">
                <Tag size={16} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Category & Priority</p>
                <p className="text-sm font-bold text-gray-800 leading-none">
                  {task.category} <span className="text-gray-300 mx-1">•</span>
                  <span className={task.priority === 'high' ? 'text-rose-500' : task.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'}>
                    {task.priority}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <section className="mb-10 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FileText size={14} /> Task Summary
            </h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {task.description || "No description provided."}
            </div>
          </section>

          {/* Financial Section - Hidden for now
          <section className="mb-12">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText size={14} /> Financial Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                <p className="text-[10px] uppercase font-bold text-amber-600 mb-1 tracking-widest">Allocated Budget</p>
                <p className="text-2xl font-black text-amber-500">
                  Rp {task.TaskActivities?.filter(a => a.type === 'budget_request')
                    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0)
                    .toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <p className="text-[10px] uppercase font-bold text-emerald-600 mb-1 tracking-widest">Total Spent</p>
                <p className="text-2xl font-black text-emerald-500">
                  Rp {task.TaskActivities?.filter(a => a.actual_cost)
                    .reduce((acc, curr) => acc + (parseFloat(curr.actual_cost) || 0), 0)
                    .toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </section>
          */}

          {/* Activity Logs */}
          <section className="mb-12">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <MessageSquare size={14} /> Activity History
            </h3>
            <div className="space-y-6">
              {task.TaskActivities?.length > 0 ? (
                task.TaskActivities.map((activity, idx) => {
                  const isSystem = activity.type === 'status_update' || activity.type === 'system' ||
                    (activity.message && (
                      activity.message.startsWith('Task dibuat oleh') || 
                      activity.message.startsWith('Task diedit oleh') ||
                      activity.message.startsWith('Komentar/Aktivitas sebelumnya telah diedit') ||
                      activity.message.startsWith('System:')
                    ));

                  if (isSystem) {
                    return (
                      <div key={idx} className="flex justify-center items-center my-4 break-inside-avoid">
                        <div className="bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold text-gray-400 shadow-sm max-w-[90%] text-center">
                          <AlertCircle size={12} className="text-[var(--color-primary)] opacity-70 shrink-0" />
                          <span className="truncate uppercase tracking-wider">
                            {activity.message || `Status changed to: ${activity.status_update}`}
                          </span>
                          <span className="opacity-50 shrink-0 ml-1 whitespace-nowrap">
                            • {new Date(activity.createdAt).toLocaleString('id-ID', {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="flex gap-4 group break-inside-avoid mb-2">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center shrink-0 z-10 bg-white">
                          {activity.User?.photo ? (
                            <img src={getFullUrl(activity.User.photo)} className="w-full h-full object-cover rounded-full" alt="" />
                          ) : <User size={12} className="text-gray-400" />}
                        </div>
                        {idx !== task.TaskActivities.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 my-1"></div>}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold text-gray-900">{activity.User?.username}</p>
                          <p className="text-[10px] text-gray-400">{new Date(activity.createdAt).toLocaleString('id-ID')}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.message || (
                          activity.type === 'budget_request' ? `Requested budget of Rp ${parseInt(activity.amount).toLocaleString('id-ID')}` :
                              'Update'
                        )}</p>
                         {activity.file_url && (
                          <div className="mt-2">
                            {activity.file_type === 'image' ? (
                              <div className="relative group/img w-fit overflow-hidden rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <img
                                  src={getFullUrl(activity.file_url)}
                                  alt="Activity attachment"
                                  className="max-w-[200px] max-h-[140px] object-cover block"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[var(--color-primary)] text-xs font-bold bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100">
                                <FileText size={12} />
                                <span>{activity.file_url.split('/').pop()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400 text-sm italic">No activity recorded for this task.</p>
              )}
            </div>
          </section>

          {/* Footer branding for report */}
          <div className="border-t border-gray-100 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center text-gray-400 sm:text-left text-center gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5">GitsEnterpriesIndustries System</p>
              <p className="text-[9px]">Laporan ini divalidasi oleh sistem manajemen tugas internal.</p>
            </div>
            <div className="text-[10px] font-mono">
              VER_TS_{new Date().getTime().toString(16).toUpperCase()}
            </div>
          </div>

        </div>

        {/* Print only footer */}
        <div className="hidden print:block fixed bottom-0 left-0 right-0 text-center text-[10px] text-gray-300 pb-4">
          © {new Date().getFullYear()} MTIS & LP Core System. Confidential Document.
        </div>

      </div>
    </div>
  );
};

export default TaskReport;
