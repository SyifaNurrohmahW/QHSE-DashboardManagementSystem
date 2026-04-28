"use client";

import { startTransition, useEffect, useState } from "react";
import EditProfileModal from "@/section/profile/editProfile";
import ProfileHeader from "@/section/profile/profileHeader";
import DetailInformasi from "@/section/profile/detailInformasi";
import UbahPasswordForm from "@/section/profile/ubahPass";
import AktivitasKeamanan from "@/section/profile/aktivitasKeamanan";
import PreferensiNotif from "@/section/profile/preferensiNotes";

const DEFAULT_PROFILE = {
  nama: "Admin QHSE Dashboard",
  username: "qhse.admin",
  email: "admin@qhse.local",
  no_hp: "+62 812 0000 0000",
  alamat: "Jakarta Operations Office",
  created_at: "2025-01-01T09:00:00.000Z",
  last_login: new Date().toISOString(),
  password_updated_at: "2026-04-10T08:30:00.000Z",
  updated_at: new Date().toISOString(),
  is_google_account: false,
};

const STORAGE_KEY = "qhse_profile_data";

export default function PengaturanPage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY);
      if (savedProfile) {
        startTransition(() => {
          setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) });
        });
      }
    } catch {
    } finally {
      startTransition(() => {
        setLoading(false);
      });
    }
  }, []);

  function handleProfileSave(nextProfile) {
    const mergedProfile = {
      ...profile,
      ...nextProfile,
      updated_at: new Date().toISOString(),
    };

    setProfile(mergedProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedProfile));
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 md:p-8">
      <ProfileHeader profile={profile} onEditClick={() => setIsEditModalOpen(true)} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <DetailInformasi profile={profile} />
          <UbahPasswordForm
            onSuccess={() => {}}
            isGoogleAccount={Boolean(profile?.is_google_account)}
          />
        </div>

        <div className="space-y-6">
          <AktivitasKeamanan profile={profile} />
          <PreferensiNotif />
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profile}
        onSuccess={handleProfileSave}
      />
    </div>
  );
}
