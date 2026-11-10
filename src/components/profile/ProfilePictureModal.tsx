'use client';

import React, { useState, useRef } from 'react';
import { useClubPulse } from '@/context/ClubPulseContext';
import {
  Camera,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Loader2,
  Palette,
} from 'lucide-react';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const INITIALS_PALETTES = [
  { id: 'slate', name: 'Institutional Slate', bg: '0f172a,1e293b,334155', color: '#0f172a' },
  { id: 'navy', name: 'Deep Navy', bg: '0a192f,172a45,303c55', color: '#0a192f' },
  { id: 'blue', name: 'Campus Blue', bg: '1e3a8a,1d4ed8,2563eb', color: '#1e3a8a' },
  { id: 'emerald', name: 'Academic Emerald', bg: '064e3b,047857,059669', color: '#047857' },
  { id: 'indigo', name: 'Royal Indigo', bg: '312e81,4338ca,4f46e5', color: '#4338ca' },
  { id: 'charcoal', name: 'Charcoal Grey', bg: '18181b,27272a,3f3f46', color: '#27272a' },
];

export default function ProfilePictureModal({
  isOpen,
  onClose,
  onSuccess,
}: ProfilePictureModalProps) {
  const { currentUser, updateProfilePicture } = useClubPulse();

  const [activeTab, setActiveTab] = useState<'upload' | 'initials' | 'url'>('upload');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentUser.avatar || '');
  const [selectedPalette, setSelectedPalette] = useState<string>(INITIALS_PALETTES[0].id);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Please select a valid image file (JPG, PNG, WebP, GIF).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setFileError('Image file is too large. Please select an image under 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelectedAvatar(dataUrl);
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPalette = (palette: typeof INITIALS_PALETTES[0]) => {
    setSelectedPalette(palette.id);
    const initialsUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      currentUser.name
    )}&backgroundColor=${palette.bg}&textColor=ffffff`;
    setSelectedAvatar(initialsUrl);
  };

  const handleGenerateDefaultInitials = () => {
    handleApplyPalette(INITIALS_PALETTES[0]);
  };

  const handleUrlApply = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    const trimmed = customUrl.trim();
    if (!trimmed) {
      setUrlError('Please enter an image link.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setUrlError('Image link must start with https:// or http://');
      return;
    }

    setSelectedAvatar(trimmed);
  };

  const handleSave = async () => {
    if (!selectedAvatar) {
      setFeedbackMsg({ text: 'Please choose or upload a profile picture.', error: true });
      return;
    }

    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const res = await updateProfilePicture(selectedAvatar);
      if (res.success) {
        setFeedbackMsg({ text: 'Profile picture successfully updated!', error: false });
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedbackMsg({ text: res.error || 'Failed to save profile picture.', error: true });
      }
    } catch {
      setFeedbackMsg({ text: 'An unexpected error occurred while saving.', error: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/90 space-y-5 animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Update Profile Picture
              </h2>
              <p className="text-xs text-slate-500">
                Upload a photo, generate a name initials avatar, or paste a link.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Section */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="relative">
            <img
              src={selectedAvatar || currentUser.avatar}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-900 shadow-xs bg-slate-200"
              onError={() => {
                setUrlError('The specified image URL could not be rendered. Please check the link.');
              }}
            />
            <span className="absolute -bottom-1 -right-1 p-1 bg-slate-900 text-white rounded-full ring-2 ring-white">
              <Camera className="w-3 h-3" />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Live Preview
            </span>
            <p className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</p>
            <p className="text-[11px] text-slate-500 font-mono truncate">
              {currentUser.registrationNumber} • {currentUser.department}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateDefaultInitials}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition"
            title="Generate avatar using initials"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-600" />
            <span>Initials</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 text-xs font-semibold text-slate-500">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('initials')}
            className={`pb-2.5 px-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'initials'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Name Initials</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 px-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image Link</span>
          </button>
        </div>

        {/* Tab 1: Upload File */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl text-center cursor-pointer transition bg-slate-50/50 hover:bg-slate-50 space-y-2"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-700 shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Click to select an image from your device
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports JPG, PNG, WebP or GIF up to 3 MB
                </p>
              </div>
            </div>

            {fileError && (
              <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fileError}</span>
              </p>
            )}
          </div>
        )}

        {/* Tab 2: Name Initials */}
        {activeTab === 'initials' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Monogram Avatar for {currentUser.name}
                </h4>
              </div>
              <p className="text-[11px] text-slate-600">
                Choose an institutional color theme to generate a crisp monogram avatar with your initials.
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-2">
                Select Theme Palette
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {INITIALS_PALETTES.map(palette => {
                  const isSelected = selectedPalette === palette.id;
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => handleApplyPalette(palette)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full shrink-0 shadow-2xs border border-white"
                        style={{ backgroundColor: palette.color }}
                      />
                      <span className="text-xs text-slate-800 leading-tight">
                        {palette.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Custom URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlApply} className="space-y-3">
            <p className="text-xs text-slate-500">
              Paste a direct image URL from GitHub, LinkedIn, Unsplash, or any image host:
            </p>

            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={e => {
                  setCustomUrl(e.target.value);
                  setUrlError(null);
                }}
                placeholder="https://example.com/avatar.jpg"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition shrink-0"
              >
                Apply URL
              </button>
            </div>

            {urlError && (
              <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{urlError}</span>
              </p>
            )}
          </form>
        )}

        {/* Feedback message */}
        {feedbackMsg && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              feedbackMsg.error
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {feedbackMsg.error ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : (
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !selectedAvatar}
              className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save as Profile Picture</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
