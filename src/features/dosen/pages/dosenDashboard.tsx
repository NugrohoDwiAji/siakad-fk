import { useState, useEffect } from "react";
import { useDosenAuthStore } from "@/features/dosen/stores/dosenAuthStore";
import Button from "@/components/ui/Button";
import EditDosenProfileModal from "@/features/dosen/components/organisms/EditDosenProfileModal";

function EditIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default function DosenDashboard() {
  const user = useDosenAuthStore((state) => state.user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  function handleProfileUpdated(message?: string) {
    setToastMessage(message || "Profil dosen berhasil diperbarui.");
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <svg
              className="h-5 w-5 text-green-600 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-green-600 hover:text-green-800 p-1 rounded-md transition-colors"
            aria-label="Tutup notifikasi"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard Dosen</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Selamat datang di panel dosen
        </p>
      </div>

      {/* User Info Card */}
      {user && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-lg overflow-hidden shrink-0 shadow-2xs">
                {user.foto_url ? (
                  <img
                    src={user.foto_url}
                    alt={user.nama_dosen}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.nama_dosen?.charAt(0)?.toUpperCase() || "D"
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    {user.nama_dosen}
                  </h2>
                  {user.status?.toLowerCase() === "kaprodi" && (
                    <span className="text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full">
                      Kaprodi
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {user.nama_program_studi || "Fakultas Kedokteran"} • NIK: {user.nik || "-"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<EditIcon />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profil
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
            <div>
              <p className="text-xs text-gray-400 font-medium">Nama Dosen</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {user.nama_dosen || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Alamat Email</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {user.alamat_email || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">NIK</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {user.nik || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">No. Telepon / WA</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {user.no_telp || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Program Studi</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {user.nama_program_studi || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Status / Jabatan</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {user.status?.toLowerCase() === "kaprodi" ? "Ketua Program Studi (Kaprodi)" : "Dosen Pengajar"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Status Dosen</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {user.status_dosen === "T" ? "Tetap" : user.status_dosen === "A" ? "Aktif" : user.status_dosen || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Homebase</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {user.homebase || user.nama_program_studi || "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && user && (
        <EditDosenProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSuccess={handleProfileUpdated}
        />
      )}
    </div>
  );
}
