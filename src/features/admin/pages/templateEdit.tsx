import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDetailTemplateBlok, updateTemplateBlok } from "@/features/admin/api/masterData";
import type { TemplateBlokDetailData, TemplateBlokTreeNode } from "@/features/admin/types";
import EditableStructureCard from "@/features/admin/components/organisms/EditableStructureCard";

export default function TemplateEdit() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TemplateBlokDetailData | null>(null);
  const [tree, setTree] = useState<TemplateBlokTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
        let treeNodes: TemplateBlokTreeNode[] = [];
        if (Array.isArray(apiData.tree)) {
          treeNodes = apiData.tree;
        } else if (apiData.tree && typeof apiData.tree === "object") {
          treeNodes = [apiData.tree as TemplateBlokTreeNode];
        } else if (apiData.structure) {
          treeNodes = [apiData.structure];
        }
        setData({ ...apiData, tree: treeNodes });
        setTree(JSON.parse(JSON.stringify(treeNodes)));
      } else {
        setError(result.message || "Gagal memuat detail template.");
      }
      setLoading(false);
    }

    fetchDetail();
    return () => { cancelled = true; };
  }, [code]);

  function getTargetNode(treeData: TemplateBlokTreeNode[], path: number[]): TemplateBlokTreeNode {
    let current = treeData;
    let target = current[path[0]];
    for (let i = 1; i < path.length; i++) {
      if (!target.children) target.children = [];
      current = target.children;
      target = current[path[i]];
    }
    return target;
  }

  function updateNode(path: number[], updates: any) {
    setTree((prev) => {
      const newTree = JSON.parse(JSON.stringify(prev)) as TemplateBlokTreeNode[];
      const target = getTargetNode(newTree, path);
      Object.assign(target, updates);
      return newTree;
    });
  }

  function addChild(path: number[]) {
    const newNode: TemplateBlokTreeNode = {
      key: `new_${Date.now()}`,
      name: "",
      weight: 0,
      type: "category",
      children: [],
    };
    setTree((prev) => {
      const newTree = JSON.parse(JSON.stringify(prev)) as TemplateBlokTreeNode[];
      const target = getTargetNode(newTree, path);
      if (!target.children) target.children = [];
      target.children.push(newNode);
      return newTree;
    });
  }

  function removeNode(path: number[]) {
    setTree((prev) => {
      const newTree = JSON.parse(JSON.stringify(prev)) as TemplateBlokTreeNode[];
      const parentPath = path.slice(0, -1);
      const idx = path[path.length - 1];
      const parent = parentPath.length > 0 ? getTargetNode(newTree, parentPath) : null;
      const arr = parent ? parent.children! : newTree;
      arr.splice(idx, 1);
      return newTree;
    });
  }

  function toggleType(path: number[]) {
    setTree((prev) => {
      const newTree = JSON.parse(JSON.stringify(prev)) as TemplateBlokTreeNode[];
      const target = getTargetNode(newTree, path);
      target.type = target.type === "input" ? "category" : "input";
      return newTree;
    });
  }

  async function handleSave() {
    if (!code || !data) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateTemplateBlok(code, {
        tree: tree,
      });
      if (result.status) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/admin/blok/master-data");
        }, 1500);
      } else {
        setError(result.message || "Gagal menyimpan template.");
      }
    } catch {
      setError("Terjadi kesalahan saat menyimpan.");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
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
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">Edit Template Penilaian</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {data ? `Template ${data.template.matakuliah}` : "Memuat data..."}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Perubahan berhasil disimpan! Mengalihkan ke halaman daftar...
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Content */}
      {!loading && data && (
        <>
          {/* Info Cards (read-only) */}
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
          </div>

          {/* Editable Structure */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Struktur Komponen</h2>
              <button
                onClick={() => addChild([])}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Tambah Root
              </button>
            </div>
            {tree.length > 0 ? (
              <div className="space-y-3">
                {tree.map((node, idx) => (
                  <EditableStructureCard
                    key={node.key || idx}
                    node={node}
                    onUpdate={updateNode}
                    onAddChild={addChild}
                    onRemove={removeNode}
                    onToggleType={toggleType}
                    path={[idx]}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                Belum ada struktur. Klik "Tambah Root" untuk menambahkan komponen pertama.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
