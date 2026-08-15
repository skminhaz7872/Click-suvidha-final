import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, doc, deleteDoc, where } from 'firebase/firestore';

export default function Banners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBannerUrl, setNewBannerUrl] = useState('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const q = query(collection(db, 'settings'), where('type', '==', 'banner'));
      const snapshot = await getDocs(q);
      const bannersData: any[] = [];
      snapshot.forEach(doc => {
        bannersData.push({ id: doc.id, ...doc.data() });
      });
      setBanners(bannersData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'settings'), {
        type: 'banner',
        imageUrl: newBannerUrl
      });
      setShowAddForm(false);
      setNewBannerUrl('');
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'settings', id));
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">App Banners (For Retailers)</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Banner</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
            Add New Banner
          </h2>
          <form onSubmit={handleAddBanner} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Banner Image URL</label>
              <input 
                type="url" 
                required 
                placeholder="https://example.com/banner.jpg" 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                value={newBannerUrl} 
                onChange={e => setNewBannerUrl(e.target.value)} 
              />
            </div>
            <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
              Save
            </button>
          </form>
          {newBannerUrl && (
            <div className="mt-4">
              <p className="text-sm text-slate-500 mb-2">Preview:</p>
              <img src={newBannerUrl} alt="Preview" className="max-h-48 rounded-lg object-cover border border-slate-200" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <img src={banner.imageUrl} alt="Banner" className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center mt-auto">
              <span className="text-sm text-slate-500 truncate max-w-[200px]" title={banner.imageUrl}>
                {banner.imageUrl}
              </span>
              <button 
                onClick={() => handleDeleteBanner(banner.id)}
                className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                title="Delete Banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p>No banners uploaded yet. Add a banner to display it to retailers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
