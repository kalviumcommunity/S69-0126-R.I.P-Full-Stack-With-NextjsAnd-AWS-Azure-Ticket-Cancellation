"use client";
import { useEffect, useState } from "react";

interface RefundRequest {
  id: string;
  originalId: number;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  submittedAt: string;
  source: string;
  destination: string;
  travelDate: string;
  busNumber: string;
  adminComment?: string;
}

interface DeclineModalState {
  isOpen: boolean;
  cancellationId: number | null;
  reason: string;
}

interface ApproveModalState {
  isOpen: boolean;
  cancellationId: number | null;
}

interface DeleteModalState {
  isOpen: boolean;
  cancellationId: number | null;
}

interface NotificationState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function AdminTerminal() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [declineModal, setDeclineModal] = useState<DeclineModalState>({
    isOpen: false,
    cancellationId: null,
    reason: "Ticket Misuse"
  });
  const [approveModal, setApproveModal] = useState<ApproveModalState>({
    isOpen: false,
    cancellationId: null
  });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    cancellationId: null
  });
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: 'success',
    message: ''
  });

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ isOpen: true, type, message });
    setTimeout(() => setNotification({ isOpen: false, type: 'success', message: '' }), 3000);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = d.getDate();
    const suffix = ["th", "st", "nd", "rd"][((day % 100) - 20) % 10] || ["th", "st", "nd", "rd"][day % 10] || "th";
    return `${day}${suffix} ${d.toLocaleString('en-US', { month: 'long' }).toLowerCase()} ${d.getFullYear()}`;
  };

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/refunds");
      if (res.ok) {
        const data = await res.json();
        // Handle both old and new API response formats
        if (data.success && data.data && Array.isArray(data.data.requests)) {
          setRequests(data.data.requests);
        } else if (Array.isArray(data)) {
          setRequests(data);
        } else {
          setRequests([]);
        }
      }
    } catch (err) {
      console.error("Failed to load refunds", err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (cancellationId: number, newStatus: 'approved' | 'declined') => {
    if (newStatus === 'declined') {
      // Open decline modal
      setDeclineModal({
        isOpen: true,
        cancellationId: cancellationId,
        reason: "Ticket Misuse"
      });
      return;
    }

    if (newStatus === 'approved') {
      // Open approve modal
      setApproveModal({
        isOpen: true,
        cancellationId: cancellationId
      });
      return;
    }
  };

  const handleApproveConfirm = async () => {
    if (!approveModal.cancellationId) return;

    await performStatusUpdate(approveModal.cancellationId, 'approved', "");
    setApproveModal({ isOpen: false, cancellationId: null });
  };

  const performStatusUpdate = async (cancellationId: number, newStatus: 'approved' | 'declined', comment: string) => {
    try {
      // Optimistic update
      setRequests((prev) =>
        prev.map((req) => (req.originalId === cancellationId ? { ...req, status: newStatus, adminComment: comment } : req))
      );

      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancellationId, status: newStatus, adminComment: comment })
      });

      if (!res.ok) {
        showNotification('error', 'Failed to update status');
        loadData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification('error', 'Error updating status');
      loadData();
    }
  };

  const handleDeclineConfirm = async () => {
    if (!declineModal.cancellationId || !declineModal.reason.trim()) {
      showNotification('error', 'Please provide a decline reason');
      return;
    }

    await performStatusUpdate(declineModal.cancellationId, 'declined', declineModal.reason);
    setDeclineModal({ isOpen: false, cancellationId: null, reason: "Ticket Misuse" });
  };

  const deleteRequest = async (cancellationId: number) => {
    setDeleteModal({ isOpen: true, cancellationId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.cancellationId) return;

    try {
      setRequests(prev => prev.filter(r => r.originalId !== deleteModal.cancellationId));

      const res = await fetch(`/api/admin/refunds?id=${deleteModal.cancellationId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        showNotification('error', 'Failed to delete record');
        loadData();
      } else {
        showNotification('success', 'Record deleted successfully');
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      showNotification('error', 'Error deleting record');
      loadData();
    }

    setDeleteModal({ isOpen: false, cancellationId: null });
  };

  const pending = requests.filter((r) => r.status === "pending");
  const approved = requests.filter((r) => r.status === "approved");
  const declined = requests.filter((r) => r.status === "declined");

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-8">
      {/* Notification Toast */}
      {notification.isOpen && (
        <div className="fixed bottom-8 right-8 z-9999 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`rounded-xl border px-6 py-4 shadow-2xl flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-emerald-900/30 border-emerald-500/50' 
              : notification.type === 'error'
              ? 'bg-rose-900/30 border-rose-500/50'
              : 'bg-blue-900/30 border-blue-500/50'
          }`}>
            {notification.type === 'success' && (
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              </div>
            )}
            {notification.type === 'error' && (
              <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </div>
            )}
            {notification.type === 'info' && (
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                </svg>
              </div>
            )}
            <span className={`text-sm font-semibold ${
              notification.type === 'success' 
                ? 'text-emerald-300' 
                : notification.type === 'error'
                ? 'text-rose-300'
                : 'text-blue-300'
            }`}>
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {declineModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-rose-500/10 p-6 border-b border-rose-500/20">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                Confirm <span className="text-rose-500">Decline</span>
              </h3>
              <p className="text-rose-400 text-[10px] uppercase tracking-widest mt-1 font-bold">
                Please provide a reason
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-rose-900/20 p-4 rounded-xl border border-rose-500/20">
                <p className="text-rose-200 text-xs font-medium leading-relaxed">
                  Are you sure you want to decline this refund request? This action will notify the user of the denial.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Decline Reason
                </label>
                <textarea
                  value={declineModal.reason}
                  onChange={(e) => setDeclineModal({ ...declineModal, reason: e.target.value })}
                  placeholder="e.g., Policy violation, Duplicate request, Invalid claim..."
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none transition-all h-20 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex gap-3 bg-slate-800/30">
              <button
                onClick={() => setDeclineModal({ isOpen: false, cancellationId: null, reason: "Ticket Misuse" })}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineConfirm}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-rose-900/20"
              >
                Decline Request
              </button>
            </div>
          </div>
        </div>      )}

      {/* Approve Confirmation Modal */}
      {approveModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-emerald-500/10 p-6 border-b border-emerald-500/20">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                Confirm <span className="text-emerald-500">Approval</span>
              </h3>
              <p className="text-emerald-400 text-[10px] uppercase tracking-widest mt-1 font-bold">
                Process the refund
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20">
                <p className="text-emerald-200 text-xs font-medium leading-relaxed">
                  Are you sure you want to approve this refund request? The customer will receive a confirmation email with the refund status.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex gap-3 bg-slate-800/30">
              <button
                onClick={() => setApproveModal({ isOpen: false, cancellationId: null })}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
              >
                Approve Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-amber-500/10 p-6 border-b border-amber-500/20">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                Delete <span className="text-amber-500">Record</span>
              </h3>
              <p className="text-amber-400 text-[10px] uppercase tracking-widest mt-1 font-bold">
                This action cannot be undone
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-500/20">
                <p className="text-amber-200 text-xs font-medium leading-relaxed">
                  Are you sure you want to delete this record permanently? This action cannot be undone and the record will be removed from the system.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex gap-3 bg-slate-800/30">
              <button
                onClick={() => setDeleteModal({ isOpen: false, cancellationId: null })}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-amber-900/20"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-b border-slate-800 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              Oversight <span className="text-rose-500">Terminal</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              System Protocol: Live Monitoring
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="text-[9px] border border-rose-500/30 text-rose-500 px-3 py-1 rounded hover:bg-rose-500 hover:text-white transition-all font-bold uppercase tracking-widest"
            >
              Reset Ledger
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMN 1 */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-amber-500/30 pb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-amber-500">Received</h2>
              <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded font-mono">{pending.length}</span>
            </div>
            <div className="space-y-4">
              {pending.map((req, index) => (
                <div key={`${req.id}-${index}`} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-bold text-sm">{req.id}</p>
                      {req.busNumber && req.busNumber !== "N/A" && (
                        <p className="text-emerald-500 text-[10px] font-mono mt-0.5">{req.busNumber}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest">Travel</p>
                      <p className="font-mono text-emerald-500 text-[10px]">{formatDate(req.travelDate)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{req.source} → {req.destination}</span>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest">Cancelled</p>
                      <p className="font-mono text-amber-500/80 text-[10px]">{formatDate(req.submittedAt)}</p>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs mb-1">{req.email}</p>
                  <p className="text-slate-500 text-[10px] italic">&quot;{req.reason}&quot;</p>
                  <div className="flex gap-2 mt-5">
                    <button onClick={() => updateStatus(req.originalId, 'approved')} className="flex-1 bg-emerald-600/10 text-emerald-500 text-[9px] font-black py-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">APPROVE</button>
                    <button onClick={() => updateStatus(req.originalId, 'declined')} className="flex-1 bg-rose-600/10 text-rose-500 text-[9px] font-black py-2 rounded-lg hover:bg-rose-600 hover:text-white transition-all">DECLINE</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Column 2 & 3 follow same pattern with unique keys */}
          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase text-emerald-500 border-b border-emerald-500/30 pb-4">Approved</h2>
            {approved.map((req, index) => (
              <div key={`${req.id}-app-${index}`} className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl relative group">
                <button
                  onClick={() => deleteRequest(req.originalId)}
                  className="absolute top-4 right-4 text-emerald-500/50 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Record"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
                <p className="text-white font-bold text-sm">{req.id}</p>
                <p className="text-slate-400 text-xs">{req.email}</p>
                <p className="text-emerald-500/50 text-[10px] mt-2 font-mono">{formatDate(req.submittedAt)}</p>
              </div>
            ))}
          </section>

          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase text-rose-500 border-b border-rose-500/30 pb-4">Declined</h2>
            {declined.map((req, index) => (
              <div key={`${req.id}-dec-${index}`} className="bg-rose-500/5 border border-rose-500/20 p-5 rounded-2xl relative group">
                <button
                  onClick={() => deleteRequest(req.originalId)}
                  className="absolute top-4 right-4 text-rose-500/50 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Record"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
                <p className="text-white/50 font-bold text-sm">{req.id}</p>
                <p className="text-emerald-500/50 text-[10px] font-mono mt-0.5 mb-2">{req.busNumber !== "N/A" ? req.busNumber : ""}</p>
                <p className="text-slate-600 text-[10px] uppercase font-bold">
                  {req.adminComment ? `Reason: ${req.adminComment}` : "Request Declined"}
                </p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}