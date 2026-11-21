import React, { useState, useRef } from 'react';
import { Camera, Image, Trash2, Upload } from 'lucide-react';
import { api } from '../../services/api';

const PRESET_SAMPLE_PHOTOS = [
  {
    title: "Suspect Vehicle (Silver Sedan)",
    url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
    caption: "Silver sedan observed trailing near the building entrance"
  },
  {
    title: "Unlit Alleyway / Scene",
    url: "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=600&auto=format&fit=crop&q=80",
    caption: "Alleyway transit route where encounter occurred"
  },
  {
    title: "Broken Door Catch / Property Damage",
    url: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80",
    caption: "Damage to residential entry latch"
  }
];

export default function CameraEvidencePicker({ onPhotosUpdated, initialPhotos = [] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    try {
      const newItems = [];
      for (const file of files) {
        // Upload to server or generate object preview
        try {
          const res = await api.uploadEvidence(file);
          newItems.push({
            id: `photo-${Date.now()}-${Math.random()}`,
            url: res.url,
            caption: file.name
          });
        } catch (uploadErr) {
          // Local preview fallback
          const objectUrl = URL.createObjectURL(file);
          newItems.push({
            id: `photo-${Date.now()}-${Math.random()}`,
            url: objectUrl,
            caption: file.name
          });
        }
      }

      const updated = [...photos, ...newItems];
      setPhotos(updated);
      if (onPhotosUpdated) onPhotosUpdated(updated);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addPresetPhoto = (preset) => {
    const item = {
      id: `photo-preset-${Date.now()}`,
      url: preset.url,
      caption: preset.caption
    };
    const updated = [...photos, item];
    setPhotos(updated);
    if (onPhotosUpdated) onPhotosUpdated(updated);
  };

  const removePhoto = (id) => {
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    if (onPhotosUpdated) onPhotosUpdated(updated);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Camera className="w-3.5 h-3.5 text-rose-500" />
          <span>Photos & Video Evidence (Optional)</span>
        </label>
        {photos.length > 0 && (
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
            {photos.length} Attached
          </span>
        )}
      </div>

      {/* Upload button & Preset quick selectors */}
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{isUploading ? 'Uploading...' : 'Take Photo / Upload'}</span>
        </button>

        {PRESET_SAMPLE_PHOTOS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => addPresetPhoto(preset)}
            className="py-1.5 px-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-400 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-[11px] flex items-center gap-1.5 transition"
          >
            <Image className="w-3 h-3 text-slate-500" />
            <span>+ Sample: {preset.title.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Photo Thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {photos.map(p => (
            <div key={p.id} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-black">
              <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-red-600 text-white transition shadow"
                title="Remove photo"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[10px] text-white truncate">
                {p.caption}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
