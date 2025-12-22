import { useState, useRef, useEffect } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import axios from 'axios';
import { useAuth } from '../../../core/context/AuthContext';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [age, setAge] = useState(18);
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [interests, setInterests] = useState<string[]>([]);
    const [photos, setPhotos] = useState<string[]>([]);

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
            const response = await axios.patch(`${API_URL}/users/me`, {
                name,
                age,
                city: location,
                bio,
                interests,
                photos
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('matchmint_auth_token')}` }
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
            alert('Failed to update profile');
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

        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = event.target?.result as string;
                    if (result) {
                        setPhotos((prev) => [...prev, result]);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#230f16] w-full max-w-lg rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 sticky top-0 bg-white dark:bg-[#230f16] z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#4b202e] text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <MaterialSymbol name="close" size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Photos Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-[#cbbc90]">Photos</label>
                            <span className="text-xs text-gray-500">{photos.length}/9 items</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {photos.map((photo, index) => (
                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-[#2a2515]">
                                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                    {index === 0 && (
                                        <div className="absolute top-1 left-1 bg-primary text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                            Main
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {index !== 0 && (
                                            <button
                                                onClick={() => handleSetProfilePhoto(index)}
                                                className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                                                title="Set as Main"
                                            >
                                                <MaterialSymbol name="star" size={16} className="text-primary" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeletePhoto(index)}
                                            className="p-1.5 bg-red-500/90 rounded-full hover:bg-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <MaterialSymbol name="delete" size={16} className="text-white" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {photos.length < 9 && (
                                <button
                                    onClick={handlePhotoUpload}
                                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-transparent"
                                >
                                    <MaterialSymbol name="add_photo_alternate" size={24} className="text-gray-400 mb-1" />
                                    <span className="text-[10px] text-gray-500">Add</span>
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a0b10] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Your Name"
                            />
                        </div>

                        {/* Age & Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-1">Age</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                                    min={18}
                                    max={100}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a0b10] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-1">Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a0b10] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a0b10] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        {/* Interests */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">Interests</label>
                            <div className="flex flex-wrap gap-2">
                                {interests.map((interest, index) => (
                                    <div key={index} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-full border border-primary/20">
                                        <input
                                            type="text"
                                            value={interest}
                                            onChange={(e) => {
                                                const newInterests = [...interests];
                                                newInterests[index] = e.target.value;
                                                setInterests(newInterests);
                                            }}
                                            className="bg-transparent border-none outline-none text-xs font-semibold text-gray-900 dark:text-white w-20"
                                        />
                                        <button
                                            onClick={() => setInterests(interests.filter((_, i) => i !== index))}
                                            className="text-gray-500 hover:text-red-500"
                                        >
                                            <MaterialSymbol name="close" size={14} />
                                        </button>
                                    </div>
                                ))}
                                {interests.length < 10 && (
                                    <button
                                        onClick={() => setInterests([...interests, ''])}
                                        className="flex items-center gap-1 px-3 py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded-full text-xs text-gray-500 hover:border-primary hover:text-primary transition-colors"
                                    >
                                        <MaterialSymbol name="add" size={14} />
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#1a0b10]/50 sticky bottom-0">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full py-3 bg-primary text-slate-900 font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
