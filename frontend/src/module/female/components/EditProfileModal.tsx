import { useState, useRef, useEffect } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import axios from 'axios';
import { useAuth } from '../../../core/context/AuthContext';
import { getAuthToken } from '../../../core/utils/auth';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [name, setName] = useState('');
    const [age, setAge] = useState(18);
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [interests, setInterests] = useState<string[]>([]);
    const [photos, setPhotos] = useState<string[]>([]);
    const [newInterest, setNewInterest] = useState('');

    useEffect(() => {
        if (isOpen && user) {
            setName(user.name || '');
            setAge(user.age || 18);
            setLocation(user.location || user.city || '');
            setBio(user.bio || '');
            setInterests(user.interests || []);
            setPhotos(user.photos || (user.avatarUrl ? [user.avatarUrl] : []));
            setSaveSuccess(false);
        }
    }, [isOpen, user]);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            await axios.patch(`${API_URL}/users/me`, {
                name, age, city: location, bio, interests, photos
            }, {
                headers: { Authorization: `Bearer ${getAuthToken()}` }
            });

            updateUser({
                name, age, city: location, location, bio, interests, photos,
                avatarUrl: photos.length > 0 ? photos[0] : ''
            });

            setSaveSuccess(true);
            setTimeout(() => onClose(), 800);
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPhotos(prev => {
                    const updated = [...prev];
                    if (updated.length === 0) updated.push(result);
                    else updated[0] = result;
                    return updated;
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const remainingSlots = 4 - photos.length;
        if (remainingSlots <= 0) return;

        Array.from(files).slice(0, remainingSlots).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = event.target?.result as string;
                    if (result) setPhotos(prev => prev.length < 4 ? [...prev, result] : prev);
                };
                reader.readAsDataURL(file);
            }
        });

        if (galleryInputRef.current) galleryInputRef.current.value = '';
    };

    const handleDeletePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSetProfilePhoto = (index: number) => {
        const newPhotos = [...photos];
        const [selected] = newPhotos.splice(index, 1);
        newPhotos.unshift(selected);
        setPhotos(newPhotos);
    };

    const handleAddInterest = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newInterest.trim();
        if (trimmed && !interests.includes(trimmed) && interests.length < 10) {
            setInterests([...interests, trimmed]);
            setNewInterest('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#f8f4f6] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-400">

            {/* ── Sticky Header ── */}
            <header className="flex items-center justify-between px-4 pt-3 pb-3 bg-white/90 backdrop-blur-xl border-b border-pink-100/50 shrink-0">
                <button
                    onClick={onClose}
                    className="size-10 flex items-center justify-center rounded-2xl bg-pink-50 text-pink-600 active:scale-90 transition-all"
                >
                    <MaterialSymbol name="arrow_back" size={22} />
                </button>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
                    EDIT PROFILE
                </h1>
                <button
                    onClick={handleSave}
                    disabled={isLoading || saveSuccess}
                    className={`h-10 px-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                        saveSuccess
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md disabled:opacity-60'
                    }`}
                >
                    {saveSuccess ? '✓ Saved' : isLoading ? 'Saving...' : 'Save'}
                </button>
            </header>

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-md md:max-w-2xl mx-auto w-full px-4 pb-16 space-y-5 pt-5">

                    {/* Avatar Hero */}
                    <div className="relative">
                        <div
                            className="w-full h-48 rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-pink-100 to-indigo-100 relative cursor-pointer"
                            onClick={() => avatarInputRef.current?.click()}
                        >
                            {photos[0] ? (
                                <img src={photos[0]} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <MaterialSymbol name="person" size={64} className="text-pink-200" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
                                <MaterialSymbol name="camera_alt" size={16} className="text-white" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Photo</span>
                            </div>
                        </div>
                        <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </div>

                    {/* Personal Details */}
                    <div className="bg-white rounded-[1.5rem] shadow-card overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-gray-50">
                            <div className="size-7 rounded-xl bg-pink-50 flex items-center justify-center">
                                <MaterialSymbol name="person" size={16} className="text-pink-600" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Personal Details</h3>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-light ml-1">{t('fullName')}</label>
                                <div className="bg-[#f8f4f6] rounded-2xl px-4 border border-pink-50 focus-within:border-pink-200 focus-within:bg-white transition-all">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full h-12 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted-light"
                                        placeholder={t('enterName')}
                                    />
                                </div>
                            </div>

                            {/* Age + Location */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-light ml-1">{t('age')}</label>
                                    <div className="bg-[#f8f4f6] rounded-2xl px-4 border border-pink-50 focus-within:border-pink-200 focus-within:bg-white transition-all">
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                                            className="w-full h-12 bg-transparent text-sm font-bold text-ink outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-light ml-1">{t('location')}</label>
                                    <div className="bg-[#f8f4f6] rounded-2xl px-4 border border-pink-50 focus-within:border-pink-200 focus-within:bg-white transition-all">
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full h-12 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted-light"
                                            placeholder={t('city')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-light ml-1">{t('bio')}</label>
                                <div className="bg-[#f8f4f6] rounded-2xl px-4 py-3 border border-pink-50 focus-within:border-pink-200 focus-within:bg-white transition-all">
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-muted-light resize-none leading-relaxed"
                                        placeholder={t('writeSomethingAboutYourself')}
                                    />
                                    <div className="text-right">
                                        <span className="text-[9px] text-muted-light font-semibold">{bio.length}/500</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interests */}
                    <div className="bg-white rounded-[1.5rem] shadow-card overflow-hidden">
                        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
                            <div className="flex items-center gap-2.5">
                                <div className="size-7 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <MaterialSymbol name="auto_fix" size={16} className="text-violet-500" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{t('interests')}</h3>
                            </div>
                            <span className="text-[9px] font-black text-muted-light">{interests.length}/10</span>
                        </div>
                        <div className="p-5 space-y-4">
                            <form onSubmit={handleAddInterest} className="flex gap-2">
                                <div className="flex-1 bg-[#f8f4f6] rounded-2xl px-4 border border-pink-50 focus-within:border-pink-200 focus-within:bg-white transition-all">
                                    <input
                                        type="text"
                                        value={newInterest}
                                        onChange={(e) => setNewInterest(e.target.value)}
                                        className="w-full h-11 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-muted-light"
                                        placeholder={t('addNewInterest')}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="size-11 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md active:scale-90 transition-all flex items-center justify-center"
                                >
                                    <MaterialSymbol name="add" size={20} />
                                </button>
                            </form>

                            {interests.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {interests.map((interest, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 animate-in slide-in-from-left-2 duration-300"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-wider text-pink-600">{interest}</span>
                                            <button
                                                onClick={() => setInterests(interests.filter((_, i) => i !== index))}
                                                className="size-5 rounded-lg flex items-center justify-center text-pink-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                            >
                                                <MaterialSymbol name="close" size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Photo Gallery */}
                    <div className="bg-white rounded-[1.5rem] shadow-card overflow-hidden">
                        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
                            <div className="flex items-center gap-2.5">
                                <div className="size-7 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <MaterialSymbol name="photo_library" size={16} className="text-indigo-500" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{t('photos')}</h3>
                            </div>
                            <span className="text-[9px] font-black text-muted-light">{photos.length}/4 SLOTS</span>
                        </div>

                        <div className="p-4 space-y-3">
                            {/* Featured slot */}
                            <div className="relative group w-full aspect-video rounded-[1.25rem] overflow-hidden bg-[#f8f4f6] border-2 border-dashed border-pink-100">
                                {photos[0] ? (
                                    <>
                                        <img src={photos[0]} alt="Featured" className="w-full h-full object-cover" />
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-rose-600 px-3 py-1 rounded-full z-20 shadow-sm">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-white flex items-center gap-1">
                                                <MaterialSymbol name="star" size={9} filled />FEATURED
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                                            <button onClick={() => handleDeletePhoto(0)} className="size-10 rounded-2xl bg-red-500 text-white flex items-center justify-center active:scale-90 transition-all shadow-lg">
                                                <MaterialSymbol name="delete" size={18} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <button onClick={() => galleryInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center gap-2">
                                        <div className="size-12 rounded-2xl bg-pink-50 flex items-center justify-center">
                                            <MaterialSymbol name="add_a_photo" size={24} className="text-pink-300" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-light">{t('addCoverPhoto')}</span>
                                    </button>
                                )}
                            </div>

                            {/* 3 small slots */}
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map((slotIndex) => (
                                    <div key={slotIndex} className="relative group aspect-square rounded-[1rem] overflow-hidden bg-[#f8f4f6] border-2 border-dashed border-pink-100">
                                        {photos[slotIndex] ? (
                                            <>
                                                <img src={photos[slotIndex]} alt={`Slot ${slotIndex}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-10">
                                                    <button onClick={() => handleSetProfilePhoto(slotIndex)} className="size-9 rounded-xl bg-white/90 text-pink-600 flex items-center justify-center active:scale-90 transition-all shadow-md">
                                                        <MaterialSymbol name="star" size={18} filled />
                                                    </button>
                                                    <button onClick={() => handleDeletePhoto(slotIndex)} className="size-9 rounded-xl bg-red-500 text-white flex items-center justify-center active:scale-90 transition-all shadow-md">
                                                        <MaterialSymbol name="delete" size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <button onClick={() => galleryInputRef.current?.click()} className="w-full h-full flex items-center justify-center">
                                                <MaterialSymbol name="add" size={24} className="text-pink-200" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-[9px] text-muted-light font-semibold text-center">
                                Tap ⭐ on any photo to set it as your cover photo
                            </p>
                        </div>
                        <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isLoading || saveSuccess}
                        className={`w-full h-14 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg ${
                            saveSuccess
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 text-white'
                        }`}
                    >
                        {saveSuccess ? (
                            <><MaterialSymbol name="check_circle" size={20} className="text-white" filled />Profile Updated!</>
                        ) : isLoading ? (
                            <><div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving Changes...</>
                        ) : (
                            <><MaterialSymbol name="save" size={20} filled />{t('saveProfileChanges')}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
