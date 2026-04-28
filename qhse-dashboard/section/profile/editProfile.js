"use client";

import { startTransition, useEffect, useState } from "react";
import { Edit, X } from "lucide-react";
import Swal from "sweetalert2";

export default function EditProfileModal({ isOpen, onClose, profileData, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    nama: "",
    username: "",
    email: "",
    no_hp: "",
    alamat: "",
  });

  useEffect(() => {
    if (isOpen && profileData) {
      startTransition(() => {
        setEditForm({
          nama: profileData.nama || "",
          username: profileData.username || "",
          email: profileData.email || "",
          no_hp: profileData.no_hp || "",
          alamat: profileData.alamat || "",
        });
      });
    }
  }, [isOpen, profileData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 350));

      onSuccess?.(editForm);
      Swal.fire("Berhasil!", "Profil berhasil diperbarui.", "success");
      onClose();
    } catch {
      Swal.fire("Error", "Terjadi kesalahan pada server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-[14px] border border-[#dfe5ea] bg-white px-4 py-3 text-sm text-[#273240] outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-[#dfe9e3] bg-white shadow-[0_28px_60px_rgba(15,23,42,0.24)]">
        <div className="border-b border-[#edf1f4] bg-[linear-gradient(135deg,#f2fbf5_0%,#ffffff_45%,#f7fbf8_100%)] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                <Edit size={14} />
                Edit Profile
              </div>
              <h3 className="mt-3 text-[22px] font-bold text-[#1f2b38]">Perbarui Data Profil</h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6e7b87] shadow-sm transition hover:bg-[#f4f7f9]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8793]">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={editForm.nama}
                onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8793]">
                Username
              </label>
              <input
                type="text"
                required
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className={`${inputClass} bg-[#f7faf8]`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8793]">
                Email
              </label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8793]">
                No. Handphone
              </label>
              <input
                type="text"
                required
                value={editForm.no_hp}
                onChange={(e) => setEditForm({ ...editForm, no_hp: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8793]">
              Alamat Lengkap
            </label>
            <textarea
              rows="4"
              required
              value={editForm.alamat}
              onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#edf1f4] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[14px] bg-[#eef2f5] px-5 py-3 text-[13px] font-semibold text-[#5a6672] transition hover:bg-[#e6ebef]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-[14px] bg-emerald-600 px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-emerald-700 disabled:bg-emerald-400"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
