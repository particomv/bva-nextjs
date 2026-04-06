'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Image, Plus, Trash2, X, Loader2, Upload } from 'lucide-react';

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    setPhotos(data || []);
    setLoading(false);
  }

  async function addPhoto(data) {
    await supabase.from('gallery').insert(data);
    setShowUpload(false); loadData();
  }

  async function deletePhoto(id) {
    if (!confirm('Delete this photo?')) return;
    await supabase.from('gallery').delete().eq('id', id);
    loadData();
  }

  if (loading) return <LoadingSpinner text="Loading gallery..." />;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Gallery</h2>
          <p className="text-sm text-white/40 mt-1">{photos.length} photos</p>
        </div>
        <button onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold">
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-20">
          <Image className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No photos yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map(photo => (
            <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] cursor-pointer"
              onClick={() => setViewPhoto(photo)}>
              {photo.url ? (
                <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-white/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs text-white font-medium truncate">{photo.caption || 'Untitled'}</p>
                  <p className="text-[10px] text-white/50">{photo.date || ''}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); deletePhoto(photo.id); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white/60 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Photo */}
      {viewPhoto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewPhoto(null)}>
          <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            {viewPhoto.url && <img src={viewPhoto.url} alt="" className="w-full rounded-xl" />}
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">{viewPhoto.caption || 'Untitled'}</p>
                <p className="text-xs text-white/30">{viewPhoto.date}</p>
              </div>
              <button onClick={() => setViewPhoto(null)} className="p-2 rounded-lg bg-white/[0.1] text-white/60">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => setShowUpload(false)}>
          <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <UploadForm onSave={addPhoto} onClose={() => setShowUpload(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function UploadForm({ onSave, onClose }) {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!url.trim()) return alert('Photo URL is required');
    setSaving(true);
    await onSave({ url, caption, date });
    setSaving(false);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white">Add Photo</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Photo URL *</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
            className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/15" />
          <p className="text-[10px] text-white/20 mt-1">Paste an image URL or Supabase storage link</p>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Caption</label>
          <input type="text" value={caption} onChange={e => setCaption(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
        </div>
        {url && (
          <div className="rounded-xl overflow-hidden border border-white/[0.06] aspect-video bg-white/[0.02]">
            <img src={url} alt="Preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
          </div>
        )}
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm">Cancel</button>
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Add
        </button>
      </div>
    </>
  );
}
