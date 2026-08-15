import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

export default function FundRequests() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    fetch('/api/fund-requests')
      .then(res => res.json())
      .then(data => setRequests(data));
  };

  const handleAction = (id: number, status: string) => {
    // Mock approve/reject
    const updated = requests.map(r => r.id === id ? { ...r, status } : r);
    setRequests(updated);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Fund Requests</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="px-6 py-3 font-medium">Req ID</th>
                <th className="px-6 py-3 font-medium">Member</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Mode & Ref</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">REQ{r.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{r.memberName}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">₹{r.amount}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-800">{r.mode}</div>
                    <div className="text-xs text-slate-500">Ref: {r.ref}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      r.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {r.status === 'Pending' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleAction(r.id, 'Approved')} className="p-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors" title="Approve">
                          <Check className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleAction(r.id, 'Rejected')} className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors" title="Reject">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">Action Taken</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
