import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, UserX, EyeOff, FileText, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ContentReport } from '@verseora/shared-types';

interface AdminPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'audit'>('reports');
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [reps, logs] = await Promise.all([
        api.getAdminReports(),
        api.getAuditLogs(50),
      ]);
      setReports(reps || []);
      setAuditLogs(logs || []);
    } catch (err: any) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResolve = async (reportId: string, resolution: 'resolved' | 'dismissed') => {
    try {
      await api.resolveReport(reportId, resolution, resolutionNotes);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: resolution } : r));
      setResolvingId(null);
      setResolutionNotes('');
    } catch (err) {
      alert('Failed to resolve report');
    }
  };

  const handleModerationAction = async (targetType: 'post' | 'user', targetId: string, action: string, reason: string) => {
    if (!window.confirm(`Are you sure you want to execute '${action}' on this ${targetType}?`)) return;
    try {
      await api.applyModerationAction({
        target_type: targetType,
        target_id: targetId,
        action,
        reason,
      });
      alert(`Action '${action}' executed.`);
      loadAdminData();
    } catch (err) {
      alert('Failed to execute action');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="p-8 rounded-3xl glass-panel border border-charcoal-800">
          <ShieldAlert className="w-12 h-12 text-verse-rose mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-ivory-100 mb-2">Restricted Access</h2>
          <p className="text-xs text-ivory-400 mb-6">
            Administrative endpoints require elevated privileges verified by the backend.
          </p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 rounded-xl bg-verse-violet text-ivory-50 text-xs font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-charcoal-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-verse-rose/10 text-verse-rose text-xs font-medium mb-2 border border-verse-rose/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Editorial Governance & Trust</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-ivory-50">
            Moderation & Platform Safety
          </h1>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-2 p-1 bg-charcoal-900 rounded-xl border border-charcoal-800 text-xs">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'reports' ? 'bg-verse-violet text-ivory-50 shadow' : 'text-ivory-400'
            }`}
          >
            Content Reports ({reports.filter(r => r.status === 'pending').length} pending)
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'audit' ? 'bg-verse-violet text-ivory-50 shadow' : 'text-ivory-400'
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-ivory-400">Loading moderation records...</div>
      ) : activeTab === 'reports' ? (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="py-16 text-center glass-panel rounded-2xl border border-charcoal-800 p-8 text-xs text-ivory-400">
              No reports filed. The community is peaceful.
            </div>
          ) : (
            reports.map(rep => (
              <div
                key={rep.id}
                className="p-6 rounded-2xl glass-panel border border-charcoal-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                      rep.status === 'pending'
                        ? 'bg-verse-amber/10 text-verse-amber border-verse-amber/20'
                        : rep.status === 'resolved'
                        ? 'bg-verse-teal/10 text-verse-teal border-verse-teal/20'
                        : 'bg-charcoal-800 text-ivory-400 border-charcoal-700'
                    }`}>
                      {rep.status}
                    </span>
                    <span className="text-xs font-semibold text-ivory-100">{rep.reason}</span>
                    <span className="text-[11px] text-ivory-400">
                      • {new Date(rep.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {rep.details && (
                    <p className="text-xs text-ivory-300 italic pt-1">
                      Report notes: "{rep.details}"
                    </p>
                  )}

                  <div className="text-[11px] text-ivory-400 pt-1">
                    {rep.post_id && <span>Target Post: <code className="text-verse-violet">{rep.post_id}</code> </span>}
                    {rep.reported_user_id && <span>Reported User: <code className="text-verse-rose">{rep.reported_user_id}</code></span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {rep.status === 'pending' && (
                    <>
                      {rep.post_id && (
                        <button
                          onClick={() => handleModerationAction('post', rep.post_id!, 'hide_post', rep.reason)}
                          className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-ivory-200 text-xs flex items-center space-x-1 border border-charcoal-700"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide Post</span>
                        </button>
                      )}

                      {rep.reported_user_id && (
                        <button
                          onClick={() => handleModerationAction('user', rep.reported_user_id!, 'suspend_user', rep.reason)}
                          className="px-3 py-1.5 rounded-xl bg-verse-rose/10 hover:bg-verse-rose/20 text-verse-rose text-xs flex items-center space-x-1 border border-verse-rose/20"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleResolve(rep.id, 'resolved')}
                        className="px-3 py-1.5 rounded-xl bg-verse-teal/10 hover:bg-verse-teal/20 text-verse-teal text-xs flex items-center space-x-1 border border-verse-teal/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>

                      <button
                        onClick={() => handleResolve(rep.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-xl bg-charcoal-800 text-ivory-400 hover:text-ivory-100 text-xs"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-charcoal-800 overflow-hidden">
          <table className="w-full text-left text-xs text-ivory-300">
            <thead className="bg-charcoal-900 border-b border-charcoal-800 text-[10px] uppercase text-ivory-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Resource ID</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-charcoal-900/40">
                  <td className="py-3 px-4 font-semibold text-ivory-100">{log.action}</td>
                  <td className="py-3 px-4">{log.resource_type}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-ivory-400 truncate max-w-xs">{log.resource_id}</td>
                  <td className="py-3 px-4 text-ivory-400">{log.ip_address || '—'}</td>
                  <td className="py-3 px-4 text-ivory-400">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

