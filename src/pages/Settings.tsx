import React, { useState, useEffect } from 'react';
import { Save, Palette, Type } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { settings, updateSettings } = useTheme();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Design & Theme Settings</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Branding Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Type className="w-5 h-5 mr-2 text-blue-600" />
              Branding
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                <input 
                  type="text" 
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL (Optional)</label>
                <input 
                  type="url" 
                  value={formData.logoUrl}
                  onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Colors Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-blue-600" />
              Theme Colors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sidebar Background</label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color" 
                    value={formData.sidebarColor}
                    onChange={e => setFormData({...formData, sidebarColor: e.target.value})}
                    className="h-10 w-10 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={formData.sidebarColor}
                    onChange={e => setFormData({...formData, sidebarColor: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg outline-none uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Header Background</label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color" 
                    value={formData.headerColor}
                    onChange={e => setFormData({...formData, headerColor: e.target.value})}
                    className="h-10 w-10 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={formData.headerColor}
                    onChange={e => setFormData({...formData, headerColor: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg outline-none uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Primary Button Color</label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="color" 
                    value={formData.primaryButtonColor}
                    onChange={e => setFormData({...formData, primaryButtonColor: e.target.value})}
                    className="h-10 w-10 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={formData.primaryButtonColor}
                    onChange={e => setFormData({...formData, primaryButtonColor: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              className="flex items-center px-6 py-2 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: settings.primaryButtonColor }}
            >
              <Save className="w-4 h-4 mr-2" />
              {saved ? 'Saved Successfully!' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
