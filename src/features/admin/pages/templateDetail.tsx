import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDetailTemplateBlok } from "@/features/admin/api/masterData";
import type { TemplateBlokDetailData, TemplateBlokTreeNode } from "@/features/admin/types";
import StructureCard from "@/features/admin/components/organisms/StructureCard";

export default function TemplateDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TemplateBlokDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      setError(null);
      const result = await getDetailTemplateBlok(code!);
      if (cancelled) return;

      if (result.status) {
        const apiData = result.data;
        // Handle tree - could be array or single object
        let treeNodes: TemplateBlokTreeNode[] = [];
        if (Array.isArray(apiData.tree)) {
          treeNodes = apiData.tree;
        } else if (apiData.tree && typeof apiData.tree === "object") {
          treeNodes = [apiData.tree as TemplateBlokTreeNode];
        } else if (apiData.structure) {
          treeNodes = [apiData.structure];
        }

        setData({
          ...apiData,
          tree: treeNodes,
        });
      } else {
        setError(result.message || "Gagal memuat detail template.");
      }
      setLoading(false);
    }

    fetchDetail();
    return () => { cancelled = true; };
  }, [code]);

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-4 p-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/blok/master-data")}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Detail Template Penilaian</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {data ? `Template ${data.template.matakuliah}` : "Memuat data..."}
            </p>
          </div>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* ── Content ── */}
      {!loading && !error && data && (
        <>
          {/* ── Info Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
              <span className="text-xs font-medium text-gray-500">Mata Kuliah</span>
              <p className="mt-1 text-sm font-semibold text-gray-800">{data.template.matakuliah}</p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
              <span className="text-xs font-medium text-gray-500">Versi</span>
              <p className="mt-1 text-sm font-semibold text-gray-800">v{data.template.versi}</p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
              <span className="text-xs font-medium text-gray-500">Angkatan</span>
              <p className="mt-1 text-sm font-semibold text-gray-800">{data.template.kurikulum_angkatan}</p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
              <span className="text-xs font-medium text-gray-500">Status</span>
              <p className="mt-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  data.template.is_active
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}>
                  {data.template.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
              <span className="text-xs font-medium text-gray-500">Dibuat</span>
              <p className="mt-1 text-sm font-semibold text-gray-800">{formatDate(data.template.created_at)}</p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-4">
              <span className="text-xs font-medium text-gray-500">Diupdate</span>
              <p className="mt-1 text-sm font-semibold text-gray-800">{formatDate(data.template.updated_at)}</p>
            </div>
          </div>

          {/* ── Structure Cards ── */}
          {data.tree.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Struktur Komponen</h2>
              <div className="space-y-3">
                {data.tree.map((node) => (
                  <StructureCard key={node.key} node={node} />
                ))}
              </div>
            </div>
          )}

          {/* ── Leaf Nodes Table ── */}
          {data.leaf_nodes.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Komponen Penilaian (Leaf Nodes)</h2>
                <p className="text-xs text-gray-500 mt-0.5">{data.leaf_nodes.length} komponen ditemukan</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 w-8">No</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Key</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Nama</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 w-24">Bobot</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 w-24">Tipe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.leaf_nodes.map((leaf, idx) => (
                      <tr key={leaf.key} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">{leaf.key}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{leaf.name}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{leaf.weight}%</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                            leaf.type === "input"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}>
                            {leaf.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
