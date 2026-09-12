import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/context/AuthContext";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";
import { GoogleMapsAutocomplete } from "../../../shared/components/GoogleMapsAutocomplete";
import axios from "axios";
import { useTranslation } from "../../../core/hooks/useTranslation";
import { getAuthToken } from "../../../core/utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const mockProfile = {
  id: "me",
  name: "",
  age: 18,
  avatar:
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
  bio: "",
  city: "",
  interests: [] as string[],
  photos: [] as string[],
};

export const FemaleProfileEditPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newInterest, setNewInterest] = useState("");

  const [editedProfile, setEditedProfile] = useState<any>(mockProfile);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      setEditedProfile({
        ...mockProfile,
        id: user.id || mockProfile.id,
        name: user.name || "",
        age: user.age || 18,
        city: user.city || user.location || "",
        bio: user.bio || "",
        interests: user.interests || [],
        avatar:
          user.avatarUrl ||
          (user.photos && user.photos[0]) ||
          mockProfile.avatar,
        photos:
          user.photos && user.photos.length > 0
            ? user.photos
            : user.avatarUrl
              ? [user.avatarUrl]
              : [],
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      let allPhotos = [...(editedProfile.photos || [])];
      if (editedProfile.avatar && !allPhotos.includes(editedProfile.avatar)) {
        allPhotos = [
          editedProfile.avatar,
          ...allPhotos.filter((p: string) => p !== editedProfile.avatar),
        ];
      }
      const sanitizedPhotos = allPhotos
        .map((p: any) => (typeof p === "object" ? p.url || p.imageUrl : p))
        .filter(Boolean);

      const payload = {
        name: editedProfile.name,
        age: Math.max(18, parseInt(editedProfile.age) || 18),
        city: editedProfile.city,
        bio: editedProfile.bio,
        interests: editedProfile.interests,
        photos: sanitizedPhotos,
      };

      await axios.patch(`${API_URL}/users/me`, payload, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      updateUser({
        name: editedProfile.name,
        age: Math.max(18, parseInt(editedProfile.age) || 18),
        city: editedProfile.city,
        location: editedProfile.city,
        bio: editedProfile.bio,
        interests: editedProfile.interests,
        photos: sanitizedPhotos,
        avatarUrl:
          sanitizedPhotos.length > 0
            ? sanitizedPhotos[0]
            : editedProfile.avatar,
      });

      setSaveSuccess(true);
      setTimeout(() => navigate("/female/my-profile"), 800);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      alert(error.response?.data?.message || t("failedToUpdateProfile"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditedProfile((prev: any) => {
          const currentPhotos = [...(prev.photos || [])];
          if (currentPhotos.length === 0) currentPhotos.push(result);
          else currentPhotos[0] = result;
          return { ...prev, avatar: result, photos: currentPhotos };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newPhotos: string[] = [...(editedProfile.photos || [])];
    const remainingSlots = 4 - newPhotos.length;
    if (remainingSlots <= 0) return;
    Array.from(files)
      .slice(0, remainingSlots)
      .forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result)
              setEditedProfile((prev: any) => ({
                ...prev,
                photos: [...(prev.photos || []), result],
              }));
          };
          reader.readAsDataURL(file);
        }
      });
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleDeletePhoto = (index: number) => {
    const newPhotos =
      editedProfile.photos?.filter((_: any, i: number) => i !== index) || [];
    const newAvatar =
      index === 0 ? newPhotos[0] || mockProfile.avatar : editedProfile.avatar;
    setEditedProfile({
      ...editedProfile,
      photos: newPhotos,
      avatar: newAvatar,
    });
  };

  const handleSetProfilePhoto = (index: number) => {
    const newPhotos = [...(editedProfile.photos || [])];
    const [selected] = newPhotos.splice(index, 1);
    newPhotos.unshift(selected);
    setEditedProfile({ ...editedProfile, photos: newPhotos, avatar: selected });
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newInterest.trim();
    if (
      trimmed &&
      !(editedProfile.interests || []).includes(trimmed) &&
      (editedProfile.interests || []).length < 10
    ) {
      setEditedProfile({
        ...editedProfile,
        interests: [...(editedProfile.interests || []), trimmed],
      });
      setNewInterest("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f4f6] font-display text-ink antialiased">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 pt-3 pb-3 bg-white/90 backdrop-blur-xl border-b border-pink-100/50">
        <button
          onClick={() => navigate(-1)}
          className="size-10 flex items-center justify-center rounded-2xl bg-pink-50 text-pink-600 active:scale-90 transition-all">
          <MaterialSymbol name="arrow_back" size={22} />
        </button>
        <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
          EDIT PROFILE
        </h1>
        <button
          onClick={handleSave}
          disabled={isSaving || saveSuccess}
          className={`h-10 px-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 ${
            saveSuccess
              ? "bg-emerald-500 text-white"
              : "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md disabled:opacity-60"
          }`}>
          {saveSuccess ? "✓ Saved" : isSaving ? "Saving..." : "Save"}
        </button>
      </header>

      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full px-4 pb-16 space-y-5 pt-5">
        {/* ── Avatar Hero ── */}
        <div className="relative">
          <div
            className="w-full h-48 rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-pink-100 to-indigo-100 relative cursor-pointer"
            onClick={() => avatarInputRef.current?.click()}>
            {editedProfile.avatar && (
              <img
                src={editedProfile.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
              <MaterialSymbol
                name="camera_alt"
                size={16}
                className="text-white"
              />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                Change Photo
              </span>
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* ── Personal Details ── */}
        <div className="bg-white rounded-[1.5rem] shadow-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-gray-50">
            <div className="size-7 rounded-xl bg-pink-50 flex items-center justify-center">
              <MaterialSymbol
                name="person"
                size={16}
                className="text-pink-600"
              />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
              Personal Details
            </h3>
          </div>

          <div className="p-5 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-light ml-1">
                {t("name")}
              </label>
              <div className="bg-[#f8f4f6] rounded-2xl px-4 border border-pink-50 focus-within:border-pink-200 focus-within:bg-white transition-all">
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, name: e.target.value })
                  }
                  className="w-full h-12 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted-light"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Age + Location side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-light ml-1">
                  {t("age")}
                </label>
                <div className="bg-[#f8f4f6] rounded-2xl px-4 border border-pink-50 focus-within:border-pink-200 focus-within:bg-white transition-all">
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={editedProfile.age}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        age: parseInt(e.target.value) || 18,
                      })
                    }
                    className="w-full h-12 bg-transparent text-sm font-bold text-ink outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-light ml-1">
                  {t("location")}
                </label>
                <div className="bg-[#f8f4f6] rounded-2xl px-4 border border-pink-50 focus-within:border-pink-200 focus-within:bg-white transition-all">
                  <GoogleMapsAutocomplete
                    value={editedProfile.city || ""}
                    onChange={(value) => {
                      setEditedProfile({ ...editedProfile, city: value });
                    }}
                    className="w-full h-12 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted-light"
                    placeholder="Your city"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-light ml-1">
                {t("bio")}
              </label>
              <div className="bg-[#f8f4f6] rounded-2xl px-4 py-3 border border-pink-50 focus-within:border-pink-200 focus-within:bg-white transition-all">
                <textarea
                  value={editedProfile.bio || ""}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, bio: e.target.value })
                  }
                  rows={4}
                  maxLength={500}
                  className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-muted-light resize-none leading-relaxed"
                  placeholder={
                    t("bioPlaceholder") ||
                    "Tell people something interesting about yourself..."
                  }
                />
                <div className="text-right">
                  <span className="text-[9px] text-muted-light font-semibold">
                    {(editedProfile.bio || "").length}/500
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Interests ── */}
        <div className="bg-white rounded-[1.5rem] shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-xl bg-violet-50 flex items-center justify-center">
                <MaterialSymbol
                  name="auto_fix"
                  size={16}
                  className="text-violet-500"
                />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                Interests
              </h3>
            </div>
            <span className="text-[9px] font-black text-muted-light">
              {(editedProfile.interests || []).length}/10
            </span>
          </div>
          <div className="p-5 space-y-4">
            {/* Add interest input */}
            <form onSubmit={handleAddInterest} className="flex gap-2">
              <div className="flex-1 bg-[#f8f4f6] rounded-2xl px-4 border border-pink-50 focus-within:border-pink-200 focus-within:bg-white transition-all">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  className="w-full h-11 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-muted-light"
                  placeholder="Add an interest..."
                />
              </div>
              <button
                type="submit"
                className="size-11 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md active:scale-90 transition-all flex items-center justify-center">
                <MaterialSymbol name="add" size={20} />
              </button>
            </form>

            {/* Tags */}
            {(editedProfile.interests || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(editedProfile.interests || []).map(
                  (interest: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 animate-in slide-in-from-left-2 duration-300">
                      <span className="text-[10px] font-black uppercase tracking-wider text-pink-600">
                        {interest}
                      </span>
                      <button
                        onClick={() =>
                          setEditedProfile({
                            ...editedProfile,
                            interests: (editedProfile.interests || []).filter(
                              (_: any, i: number) => i !== index,
                            ),
                          })
                        }
                        className="size-5 rounded-lg flex items-center justify-center text-pink-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <MaterialSymbol name="close" size={12} />
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Photo Gallery ── */}
        <div className="bg-white rounded-[1.5rem] shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-xl bg-indigo-50 flex items-center justify-center">
                <MaterialSymbol
                  name="photo_library"
                  size={16}
                  className="text-indigo-500"
                />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                Photo Gallery
              </h3>
            </div>
            <span className="text-[9px] font-black text-muted-light">
              {(editedProfile.photos || []).length}/4 SLOTS
            </span>
          </div>

          <div className="p-4 space-y-3">
            {/* Featured large slot */}
            <div className="relative group w-full aspect-video rounded-[1.25rem] overflow-hidden bg-[#f8f4f6] border-2 border-dashed border-pink-100">
              {editedProfile.photos?.[0] ? (
                <>
                  <img
                    src={editedProfile.photos[0]}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-rose-600 px-3 py-1 rounded-full z-20 shadow-sm">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white flex items-center gap-1">
                      <MaterialSymbol name="star" size={9} filled />
                      FEATURED
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                    <button
                      onClick={() => handleDeletePhoto(0)}
                      className="size-10 rounded-2xl bg-red-500 text-white flex items-center justify-center active:scale-90 transition-all shadow-lg">
                      <MaterialSymbol name="delete" size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <div className="size-12 rounded-2xl bg-pink-50 flex items-center justify-center">
                    <MaterialSymbol
                      name="add_a_photo"
                      size={24}
                      className="text-pink-300"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-light">
                    Add Cover Photo
                  </span>
                </button>
              )}
            </div>

            {/* 3 small slots */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((slotIndex) => (
                <div
                  key={slotIndex}
                  className="relative group aspect-square rounded-[1rem] overflow-hidden bg-[#f8f4f6] border-2 border-dashed border-pink-100">
                  {editedProfile.photos?.[slotIndex] ? (
                    <>
                      <img
                        src={editedProfile.photos[slotIndex]}
                        alt={`Photo ${slotIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-10">
                        <button
                          onClick={() => handleSetProfilePhoto(slotIndex)}
                          className="size-9 rounded-xl bg-white/90 text-pink-600 flex items-center justify-center active:scale-90 transition-all shadow-md"
                          title="Set as profile photo">
                          <MaterialSymbol name="star" size={18} filled />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(slotIndex)}
                          className="size-9 rounded-xl bg-red-500 text-white flex items-center justify-center active:scale-90 transition-all shadow-md">
                          <MaterialSymbol name="delete" size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-full h-full flex items-center justify-center">
                      <MaterialSymbol
                        name="add"
                        size={24}
                        className="text-pink-200"
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[9px] text-muted-light font-semibold text-center">
              Tap ⭐ on any photo to set it as your cover photo
            </p>
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryFileChange}
            className="hidden"
          />
        </div>

        {/* ── Save Button ── */}
        <button
          onClick={handleSave}
          disabled={isSaving || saveSuccess}
          className={`w-full h-14 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg ${
            saveSuccess
              ? "bg-emerald-500 text-white"
              : "bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 text-white"
          }`}>
          {saveSuccess ? (
            <>
              <MaterialSymbol
                name="check_circle"
                size={20}
                className="text-white"
                filled
              />
              Profile Updated!
            </>
          ) : isSaving ? (
            <>
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <MaterialSymbol name="save" size={20} filled />
              {t("saveChanges")}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
