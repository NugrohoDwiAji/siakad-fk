import { useState, useEffect } from "react";
import { getSksRuleDetail } from "@/features/admin/api/krs";
import type { SksRuleItem } from "@/features/admin/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SksRuleDetailCardProps {
  code: string;
  onClose: () => void;
}

// ─── Info Item ────────────────────────────────────────────────────────────────

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-gray-400 font-medium">{label}</dt>
      <dd className="text-sm text-gray-800 font-medium">{value}</dd>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SksRuleDetailCard({ code, onClose }: SksRuleDetailCardProps) {
  const [data, setData] = useState<SksRuleItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      setError(null);

      const result = await getSksRuleDetail(code);
      if (cancelled) return;

      if (result.status) {
        setData(result.data);
      } else {
        setError(result.message);
      }
      setLoading(false);
    }

    fetchDetail();
    return () => { cancelled = true; };
  }, [code]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="font-semibold text-gray-800">Detail SKS Rule</h2>
            <p className="text-xs text-gray-400 mt-0.5">Informasi lengkap SKS rule</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        ) : error ? (
          <div className="p-5 text-center text-red-500 text-sm">{error}</div>
        ) : data ? (
          <div className="p-5">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoItem label="Program Studi" value={data.nama_program_studi} />
              <InfoItem label="IP Minimum" value={data.ip_min.toFixed(2)} />
              <InfoItem label="IP Maksimum" value={data.ip_max.toFixed(2)} />
              <InfoItem label="SKS yang Dapat Diambil" value={String(data.sks_yang_dapat_diambil)} />
              <InfoItem label="Dibuat" value={formatDate(data.created_at)} />
              <InfoItem label="Diperbarui" value={formatDate(data.updated_at)} />
            </dl>
          </div>
        ) : null}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex justify-end rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-800 text-white hover:bg-brand-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
