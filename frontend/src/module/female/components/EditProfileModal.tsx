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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
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
            setPhotos(user.photos || []);
        }
    }, [isOpen, user]);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            await axios.patch(`${API_URL}/users/me`, {
                name,
                age,
                city: location,
                bio,
                interests,
                photos
            }, {
                headers: { Authorization: `Bearer ${getAuthToken()}` }
            });

            updateUser({
                name,
                age,
                city: location,
                location,
                bio,
                interests,
                photos,
                avatarUrl: photos.length > 0 ? photos[0] : ''
            });

            onClose();
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhotoUpload = () => {
        fileInputRef.current?.click();
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
                    if (result) {
                        setPhotos((prev) => {
                            if (prev.length < 4) {
                                return [...prev, result];
                            }
                            return prev;
                        });
                    }
                };
                reader.readAsDataURL(file);
            }
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeletePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSetProfilePhoto = (index: number) => {
        const newPhotos = [...photos];
        const [selectedPhoto] = newPhotos.splice(index, 1);
        newPhotos.unshift(selectedPhoto);
        setPhotos(newPhotos);
    };

    const handleAddInterest = (e: React.FormEvent) => {
        e.preventDefault();
        if (newInterest.trim() && !interests.includes(newInterest.trim()) && interests.length < 10) {
            setInterests([...interests, newInterest.trim()]);
            setNewInterest('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500">
            
            <div className="relative z-10 bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Header - Light Mesh Glass */}
                <div className="flex items-center justify-between px-8 pb-6 pt-4 border-b border-slate-100 bg-slate-50/50 backdrop-blur-md shrink-0">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black tracking-tight text-slate-800">{t('editProfile')}</h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('vaultSettings')}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-12 rounded-2xl flex items-center justify-center bg-slate-100 text-slate-400 active:scale-90 transition-all hover:bg-pink-50 hover:text-pink-500"
                    >
                        <MaterialSymbol name="close" size={24} />
                    </button>
                </div>

                {/* Content - Light Mode Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-white">
                    
                    {/* Photo Grid */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-3">
                                <MaterialSymbol name="photo_library" size={20} className="text-pink-500" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800 underline decoration-pink-500/20 underline-offset-4">{t('photos')}</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{photos.length}/4</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            {/* Featured Slot */}
                            <div className="col-span-3 aspect-video relative group rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
                                {photos[0] ? (
                                    <>
                                        <img src={photos[0]} alt="Featured" className="size-full object-cover" />
                                        <div className="absolute top-4 left-4 bg-pink-500 px-3 py-1 rounded-full shadow-lg z-20">
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-1">
                                                <MaterialSymbol name="star" size={10} filled />
                                                {t('featured')}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button onClick={() => handleDeletePhoto(0)} className="size-12 rounded-2xl bg-red-500 text-white shadow-xl active:scale-95 transition-all">
                                                <MaterialSymbol name="delete" size={24} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <button onClick={handlePhotoUpload} className="size-full flex flex-col items-center justify-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-pink-200 hover:bg-pink-50 transition-all group">
                                        <MaterialSymbol name="add_a_photo" size={40} className="text-slate-300 group-hover:text-pink-300 transition-colors" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('addCoverPhoto')}</span>
                                    </button>
                                )}
                            </div>

                            {/* Others */}
                            {[1, 2, 3].map((slotIndex) => (
                                <div key={slotIndex} className="aspect-square relative group rounded-[1.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                                    {photos[slotIndex] ? (
                                        <>
                                            <img src={photos[slotIndex]} alt={`Slot ${slotIndex}`} className="size-full object-cover" />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <button onClick={() => handleSetProfilePhoto(slotIndex)} className="size-10 rounded-xl bg-white/90 text-pink-500 shadow-lg active:scale-95 transition-all">
                                                    <MaterialSymbol name="star" size={20} filled />
                                                </button>
                                                <button onClick={() => handleDeletePhoto(slotIndex)} className="size-10 rounded-xl bg-red-500 text-white shadow-lg active:scale-95 transition-all">
                                                    <MaterialSymbol name="delete" size={20} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <button onClick={handlePhotoUpload} className="size-full flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-pink-200 transition-all">
                                            <MaterialSymbol name="add" size={24} className="text-slate-300" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                    </section>

                    {/* Basic Info Inputs */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-3 px-1">
                            <MaterialSymbol name="person" size={20} className="text-pink-500" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">{t('personalDetails')}</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('fullName')}</label>
                                <div className="bg-slate-50 rounded-2xl p-1.5 px-4 border border-slate-100 focus-within:border-pink-100 focus-within:bg-white transition-all shadow-inner">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full h-12 bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-300"
                                        placeholder={t('enterName')}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('age')}</label>
                                    <div className="bg-slate-50 rounded-2xl p-1.5 px-4 border border-slate-100 focus-within:border-pink-100 focus-within:bg-white transition-all shadow-inner">
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                                            className="w-full h-12 bg-transparent text-sm font-bold text-slate-800 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('location')}</label>
                                    <div className="bg-slate-50 rounded-2xl p-1.5 px-4 border border-slate-100 focus-within:border-pink-100 focus-within:bg-white transition-all shadow-inner">
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full h-12 bg-transparent text-sm font-bold text-slate-800 outline-none"
                                            placeholder={t('city')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('bio')}</label>
                                <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100 focus-within:border-pink-100 focus-within:bg-white transition-all shadow-inner">
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-300 resize-none leading-relaxed"
                                        placeholder={t('writeSomethingAboutYourself')}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Interests Section */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-3 px-1">
                            <MaterialSymbol name="auto_fix" size={20} className="text-pink-500" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">{t('interests')}</h3>
                        </div>

                        <div className="space-y-4">
                            <form onSubmit={handleAddInterest} className="flex gap-2">
                                <div className="flex-1 bg-slate-50 rounded-2xl p-1 px-4 border border-slate-100 shadow-inner">
                                    <input
                                        type="text"
                                        value={newInterest}
                                        onChange={(e) => setNewInterest(e.target.value)}
                                        className="w-full h-10 bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-800 outline-none placeholder:text-slate-300"
                                        placeholder={t('addNewInterest')}
                                    />
                                </div>
                                <button type="submit" className="size-12 rounded-2xl bg-pink-500 text-white shadow-lg active:scale-90 transition-all">
                                    <MaterialSymbol name="add" size={24} />
                                </button>
                            </form>

                            <div className="flex flex-wrap gap-2">
                                {interests.map((interest, index) => (
                                    <div key={index} className="flex items-center gap-2 pl-4 pr-2 py-2 rounded-xl bg-slate-50 border border-slate-100 animate-in slide-in-from-left-2 duration-300">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{interest}</span>
                                        <button
                                            onClick={() => setInterests(interests.filter((_, i) => i !== index))}
                                            className="size-6 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                        >
                                            <MaterialSymbol name="close" size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-8 pt-4 border-t border-slate-100 bg-white shrink-0">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full h-16 bg-pink-500 text-white rounded-2xl shadow-xl hover:bg-pink-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <div className="size-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                              <span className="text-xs font-black uppercase tracking-[0.3em]">{t('saveProfileChanges')}</span>
                              <MaterialSymbol name="lock" size={20} className="opacity-50" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
