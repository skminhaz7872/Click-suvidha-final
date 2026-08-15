import React, { useState, useEffect } from 'react';
import { Plus, Search, Server, Power, Edit, Trash2, Check, X } from 'lucide-react';

export default function APIRoutes() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    apiName: '', apiUrl: '', apiKey: '', rechargeType: 'Mobile',
    priority: '1', successResponse: 'SUCCESS', failedResponse: 'FAILED',
    pendingResponse: 'PENDING', balanceCheckUrl: '', status: 'Active'
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = () => {
    fetch('/api/routes')
      .then(res => res.json())
      .then(data => setRoutes(data))
      .catch(err => console.error(err));
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddForm(false);
        fetchRoutes();
        setFormData({ 
          apiName: '', apiUrl: '', apiKey: '', rechargeType: 'Mobile',
          priority: '1', successResponse: 'SUCCESS', failedResponse: 'FAILED',
          pendingResponse: 'PENDING', balanceCheckUrl: '', status: 'Active' 
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await fetch(`/api/routes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">API Route Management</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showAddForm ? 'Cancel' : 'Add New API'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Server className="w-5 h-5 mr-2 text-blue-600" />
            Configure New API Route
          </h2>
          <form onSubmit={handleAddRoute} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">API Name</label>
              <input type="text" required placeholder="e.g. Lapu API" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.apiName} onChange={e => setFormData({...formData, apiName: e.target.value})} />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">API URL Endpoint</label>
              <input type="url" required placeholder="https://api.provider.com/recharge?..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.apiUrl} onChange={e => setFormData({...formData, apiUrl: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">API Key / Token</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Recharge Type</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.rechargeType} onChange={e => setFormData({...formData, rechargeType: e.target.value})}>
                <option value="Mobile">Mobile Only</option>
                <option value="DTH">DTH Only</option>
                <option value="Both">Both (Mobile & DTH)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Route Priority</label>
              <input type="number" min="1" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Success Response Word</label>
              <input type="text" placeholder="e.g. SUCCESS" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.successResponse} onChange={e => setFormData({...formData, successResponse: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Failed Response Word</label>
              <input type="text" placeholder="e.g. FAILED" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.failedResponse} onChange={e => setFormData({...formData, failedResponse: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pending Response Word</label>
              <input type="text" placeholder="e.g. PENDING" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.pendingResponse} onChange={e => setFormData({...formData, pendingResponse: e.target.value})} />
            </div>
            <div className="lg:col-span-3 flex justify-end mt-2">
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                Save API Route
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-semibold text-slate-700">Configured API Routes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-sm">
                <th className="px-6 py-3 font-medium">Provider Name</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routes.map((route) => (
                <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{route.apiName}</div>
                    <div className="text-xs text-slate-500 truncate max-w-xs" title={route.apiUrl}>{route.apiUrl}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {route.rechargeType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {route.priority}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${route.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {route.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => toggleStatus(route.id, route.status)}
                        className={`p-1.5 rounded transition-colors ${route.status === 'Active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        title={route.status === 'Active' ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No API routes configured. Add an API to process recharges.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
