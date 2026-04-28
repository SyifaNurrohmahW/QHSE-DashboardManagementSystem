"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import Swal from "sweetalert2";

function UbahPasswordForm({ onSuccess, isGoogleAccount = false }) {
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const inputClass =
    "w-full rounded-[14px] border border-[#dfe5ea] bg-white px-4 py-3 text-sm text-[#273240] outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return Swal.fire(
        "Oops!",
        "Konfirmasi password tidak sama dengan password baru",
        "error",
      );
    }

    if (passwordForm.newPassword.length < 8) {
      return Swal.fire("Oops!", "Password baru minimal 8 karakter", "warning");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/ubah-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          passwordLama: passwordForm.oldPassword,
          passwordBaru: passwordForm.newPassword,
          konfirmasiPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire(
          "Berhasil!",
          data.message || "Password berhasil diubah",
          "success",
        );
        onSuccess?.();
        localStorage.removeItem("token");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        Swal.fire("Gagal", data.message || "Gagal mengubah password", "error");
      }
    } catch {
      Swal.fire("Error", "Terjadi kesalahan pada server", "error");
    }
  };

  if (isGoogleAccount) {
    return (
      <div className="rounded-[22px] border border-[#dfe9e3] bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-[18px] font-semibold text-[#1f2b38]">
          <KeyRound size={18} className="text-emerald-700" />
          Pengaturan Password
        </h2>
        <div className="rounded-[18px] border border-emerald-100 bg-gradient-to-r from-emerald-50 to-lime-50 px-4 py-4">
          <p className="mb-1 text-sm font-semibold text-emerald-900">
            Akun Google tidak menggunakan password lokal
          </p>
          <p className="text-xs leading-5 text-emerald-800">
            Password untuk akun ini dikelola langsung oleh Google, jadi form ubah password tidak ditampilkan di sini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-[#dfe9e3] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <KeyRound size={18} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
            Password
          </p>
          <h2 className="mt-1 text-[18px] font-semibold text-[#1f2b38]">
            Ubah Password Admin
          </h2>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-5">
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8793]">
            Password Lama
          </label>
          <input
            type="password"
            required
            placeholder="Masukkan password lama"
            value={passwordForm.oldPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8793]">
            Password Baru
          </label>
          <input
            type="password"
            required
            placeholder="Minimal 8 karakter"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8793]">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            required
            placeholder="Ulangi password baru"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                confirmPassword: e.target.value,
              })
            }
            className={inputClass}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-emerald-700"
          >
            <KeyRound size={15} />
            Ubah Password
          </button>
        </div>
      </form>
    </div>
  );
}

export default UbahPasswordForm;
