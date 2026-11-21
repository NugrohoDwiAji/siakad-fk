import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPenilaianBlok, getAllMatakuliah } from "@/features/admin/api/masterData";
import { getKurikulumAngkatan } from "@/features/admin/api/kurikulum";
import type { PenilaianTreeNode, PenilaianStructure, MataKuliahItem, KurikulumAngkatanItem } from "@/features/admin/types";
import StructureCard from "@/features/admin/components/organisms/StructureCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createNode(name = "", weight = 0, type?: string): PenilaianTreeNode {
  const node: PenilaianTreeNode = { name, weight };
  if (type) node.type = type;
  return node;
}

function ensureLeafType(nodes: PenilaianTreeNode[]): PenilaianTreeNode[] {
  return nodes.map((n) => {
    if (!n.children || n.children.length === 0) {
      return { ...n, type: "input" };
    }
    return { ...n, children: ensureLeafType(n.children) };
  });
}

function addChild(nodes: PenilaianTreeNode[], path: number[], newNode: PenilaianTreeNode): PenilaianTreeNode[] {
  if (path.length === 0) return [...nodes, newNode];
  const [idx, ...rest] = path;
  return nodes.map((n, i) => {
    if (i !== idx) return n;
    const children = n.children ? [...n.children] : [];
    return { ...n, children: addChild(children, rest, newNode) };
  });
}

function updateNode(nodes: PenilaianTreeNode[], path: number[], updates: Partial<PenilaianTreeNode>): PenilaianTreeNode[] {
  if (path.length === 0) return nodes;
  const [idx, ...rest] = path;
  return nodes.map((n, i) => {
    if (i !== idx) return n;
    if (rest.length === 0) return { ...n, ...updates };
    const children = n.children ? [...n.children] : [];
    return { ...n, children: updateNode(children, rest, updates) };
  });
}

function removeNode(nodes: PenilaianTreeNode[], path: number[]): PenilaianTreeNode[] {
  if (path.length === 0) return nodes;
  const [idx, ...rest] = path;
  if (rest.length === 0) return nodes.filter((_, i) => i !== idx);
  return nodes.map((n, i) => {
    if (i !== idx) return n;
    const children = n.children ? [...n.children] : [];
    return { ...n, children: removeNode(children, rest) };
  });
}

function isLeaf(node: PenilaianTreeNode): boolean {
  return !node.children || node.children.length === 0;
}

// ─── Recursive Tree Node Component ────────────────────────────────────────────

interface TreeNodeProps {
  node: PenilaianTreeNode;
  path: number[];
  depth: number;
  onAddChild: (path: number[]) => void;
  onUpdate: (path: number[], updates: Partial<PenilaianTreeNode>) => void;
  onRemove: (path: number[]) => void;
  onToggleType: (path: number[]) => void;
}

function TreeNodeCard({ node, path, depth, onAddChild, onUpdate, onRemove, onToggleType }: TreeNodeProps) {
  const indent = depth * 24;
  const leaf = isLeaf(node);

  return (
    <div style={{ marginLeft: indent }} className="mt-2">
      <div className={`rounded-lg border ${depth === 0 ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-white"} p-3`}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Collapse / expand indicator for non-leaf */}
          {!leaf && (
            <span className="text-gray-400 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          )}

          {/* Name input */}
          <input
            type="text"
            value={node.name}
            onChange={(e) => onUpdate(path, { name: e.target.value })}
            placeholder={depth === 0 ? "Nama komponen utama" : "Nama komponen"}
            className={`flex-1 min-w-[150px] rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition ${leaf ? "placeholder-gray-400" : "font-medium placeholder-gray-500"}`}
          />

          {/* Weight input */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={node.weight || ""}
              onChange={(e) => onUpdate(path, { weight: parseInt(e.target.value) || 0 })}
              min="0"
              max="100"
              placeholder="0"
              className="w-16 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-800 text-center outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
            <span className="text-xs text-gray-400">%</span>
          </div>

          {/* Type badge (only for leaf nodes) */}
          {leaf && (
            <button
              onClick={() => onToggleType(path)}
              className={`px-2 py-1 rounded-md text-xs font-medium border transition ${
                node.type === "input"
                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {node.type === "input" ? "Input" : "Header"}
            </button>
          )}

          {/* Add child button */}
          <button
            onClick={() => onAddChild(path)}
            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
            title="Tambah child"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Remove button */}
          <button
            onClick={() => onRemove(path)}
            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition"
            title="Hapus"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Children */}
        {node.children && node.children.length > 0 && (
          <div className="mt-2 space-y-0">
            {node.children.map((child, idx) => (
              <TreeNodeCard
                key={`${path.join("-")}-${idx}`}
                node={child}
                path={[...path, idx]}
                depth={depth + 1}
                onAddChild={onAddChild}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onToggleType={onToggleType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper: Get leaf nodes from tree ────────────────────────────────────────

function getLeafNodes(nodes: PenilaianTreeNode[]): PenilaianTreeNode[] {
  const leaves: PenilaianTreeNode[] = [];
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) {
      leaves.push(node);
    } else {
      leaves.push(...getLeafNodes(node.children));
    }
  }
  return leaves;
}

// ─── Display Tree Node (read-only) ──────────────────────────────────────────

function DisplayTreeNode({ nodes, depth }: { nodes: PenilaianTreeNode[]; depth: number }) {
  const indent = depth * 24;

  return (
    <>
      {nodes.map((node, idx) => {
        const hasChildren = node.children && node.children.length > 0;
        return (
          <div key={idx} style={{ marginLeft: indent }}>
            <div className={`flex items-center gap-2 py-1.5 px-3 rounded-md ${depth === 0 ? "bg-blue-50/50" : "hover:bg-gray-50"}`}>
              {hasChildren ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <span className="w-3.5 shrink-0" />
              )}
              <span className="text-sm text-gray-800">{node.name || "(Tanpa nama)"}</span>
              <span className="text-xs text-gray-500 font-medium">({node.weight}%)</span>
              {node.type && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                  node.type === "input"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}>
                  {node.type}
                </span>
              )}
            </div>
            {hasChildren && (
              <DisplayTreeNode nodes={node.children!} depth={depth + 1} />
            )}
          </div>
        );
      })}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PenilaianBlok() {
  const navigate = useNavigate();
  const [codeMatakuliah, setCodeMatakuliah] = useState("");
  const [codeKurikulumAngkatan, setCodeKurikulumAngkatan] = useState("");
  const [codeKurikulumForMatakuliah, setCodeKurikulumForMatakuliah] = useState("");
  const [structureName, setStructureName] = useState("");
  const [children, setChildren] = useState<PenilaianTreeNode[]>([]);
  const [matakuliahList, setMatakuliahList] = useState<MataKuliahItem[]>([]);
  const [kurikulumList, setKurikulumList] = useState<KurikulumAngkatanItem[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [toast, setToast] = useState<{ type: "error"; message: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // ── Fetch kurikulum on mount ──

  useEffect(() => {
    let cancelled = false;

    async function fetchKurikulum() {
      setDropdownLoading(true);
      const kurResult = await getKurikulumAngkatan();
      if (cancelled) return;
      if (kurResult.status) setKurikulumList(kurResult.data);
      setDropdownLoading(false);
    }

    fetchKurikulum();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch matakuliah when kurikulum selected ──

  useEffect(() => {
    if (!codeKurikulumForMatakuliah) return;

    let cancelled = false;

    async function fetchMatakuliah() {
      const mkResult = await getAllMatakuliah(codeKurikulumForMatakuliah);
      if (cancelled) return;
      if (mkResult.status) setMatakuliahList(mkResult.data);
    }

    fetchMatakuliah();
    return () => { cancelled = true; };
  }, [codeKurikulumForMatakuliah]);

  // ── Tree operations ──

  function handleAddChild(parentPath: number[]) {
    const newNode = createNode();
    setChildren((prev) => addChild(prev, parentPath, newNode));
  }

  function handleUpdate(path: number[], updates: Partial<PenilaianTreeNode>) {
    setChildren((prev) => updateNode(prev, path, updates));
  }

  function handleRemove(path: number[]) {
    setChildren((prev) => removeNode(prev, path));
  }

  function handleToggleType(path: number[]) {
    setChildren((prev) => {
      const node = getNodeAt(prev, path);
      if (!node) return prev;
      return updateNode(prev, path, { type: node.type === "input" ? undefined : "input" });
    });
  }

  function getNodeAt(nodes: PenilaianTreeNode[], path: number[]): PenilaianTreeNode | null {
    if (path.length === 0) return null;
    const [idx, ...rest] = path;
    const node = nodes[idx];
    if (!node) return null;
    if (rest.length === 0) return node;
    return node.children ? getNodeAt(node.children, rest) : null;
  }

  function handleReset() {
    setCodeMatakuliah("");
    setCodeKurikulumAngkatan("");
    setCodeKurikulumForMatakuliah("");
    setStructureName("");
    setChildren([]);
    setShowPreview(false);
  }

  async function handleSave() {
    if (!codeMatakuliah.trim() || !codeKurikulumAngkatan.trim() || !structureName.trim()) {
      setToast({ type: "error", message: "Semua field wajib diisi." });
      return;
    }

    setSaving(true);
    setErrors(null);
    const structure: PenilaianStructure = {
      name: structureName,
      weight: 100,
      children: ensureLeafType(children),
    };
    const requestBody = {
      code_matakuliah: codeMatakuliah,
      code_kurikulum_angkatan: codeKurikulumAngkatan,
      structure,
    };
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));
    const result = await createPenilaianBlok(requestBody);
    setSaving(false);

    if (result.status) {
      setShowSuccess(true);
    } else {
      if (result.errors) {
        setErrors(result.errors);
      }
      setToast({ type: "error", message: result.message || "Gagal menyimpan data." });
    }
  }

  const previewJson: PenilaianStructure = {
    name: structureName,
    weight: 100,
    children: ensureLeafType(children),
  };

  console.log(kurikulumList, matakuliahList);

  return (
    <div className="space-y-4 p-6">
      {/* ── Header ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
        <h1 className="text-xl font-semibold text-gray-800">Setup Penilaian Blok</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Konfigurasi struktur penilaian blok mata kuliah.
        </p>
      </div>

      {/* ── Form Fields ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 space-y-4">
        {/* General Error */}
        {errors?.general && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
            {errors.general.map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Kurikulum Angkatan <span className="text-red-500">*</span></label>
            <select
              value={codeKurikulumAngkatan}
              onChange={(e) => {
                const selected = kurikulumList.find((k) => k.code === e.target.value);
                setCodeKurikulumAngkatan(selected?.code || "");
                setCodeKurikulumForMatakuliah(selected?.code_nama_kurikulum || "");
                setCodeMatakuliah("");
                setMatakuliahList([]);
                if (errors?.code_kurikulum_angkatan) setErrors((prev) => { if (!prev) return null; const next = { ...prev }; delete next.code_kurikulum_angkatan; return Object.keys(next).length === 0 ? null : next; });
              }}
              disabled={dropdownLoading}
              className={`w-full rounded-lg border ${errors?.code_kurikulum_angkatan ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition disabled:opacity-50`}
            >
              <option value="">
                {dropdownLoading ? "Memuat data..." : "-- Pilih Kurikulum --"}
              </option>
              {kurikulumList.map((k) => (
                <option key={k.code} value={k.code}>
                  {k.nama_kurikulum} ({k.angkatan})
                </option>
              ))}
            </select>
            {errors?.code_kurikulum_angkatan && <p className="mt-1 text-xs text-red-500">{errors.code_kurikulum_angkatan[0]}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Mata Kuliah <span className="text-red-500">*</span></label>
            <select
              value={codeMatakuliah}
              onChange={(e) => { setCodeMatakuliah(e.target.value); if (errors?.code_matakuliah) setErrors((prev) => { if (!prev) return null; const next = { ...prev }; delete next.code_matakuliah; return Object.keys(next).length === 0 ? null : next; }); }}
              disabled={!codeKurikulumAngkatan}
              className={`w-full rounded-lg border ${errors?.code_matakuliah ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition disabled:opacity-50`}
            >
              <option value="">
                {!codeKurikulumAngkatan ? "Pilih kurikulum terlebih dahulu" : "-- Pilih Mata Kuliah --"}
              </option>
              {matakuliahList.map((mk) => (
                <option key={mk.code} value={mk.code_matakuliah}>
                  {mk.kode_matakuliah} — {mk.nama_matakuliah}
                </option>
              ))}
            </select>
            {errors?.code_matakuliah && <p className="mt-1 text-xs text-red-500">{errors.code_matakuliah[0]}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nama Struktur <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={structureName}
            onChange={(e) => { setStructureName(e.target.value); if (errors?.structure) setErrors((prev) => { if (!prev) return null; const next = { ...prev }; delete next.structure; return Object.keys(next).length === 0 ? null : next; }); }}
            placeholder="Contoh: Penilaian Kardiologi"
            className={`w-full rounded-lg border ${errors?.structure ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"} px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition`}
          />
          {errors?.structure && <p className="mt-1 text-xs text-red-500">{errors.structure[0]}</p>}
        </div>
      </div>

      {/* ── Tree Builder ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Struktur Penilaian</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
            >
              {showPreview ? "Sembunyikan Preview" : "Preview Struktur"}
            </button>
            <button
              onClick={() => handleAddChild([])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Komponen
            </button>
          </div>
        </div>

        {/* Tree nodes */}
        {children.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Belum ada komponen. Klik &quot;Tambah Komponen&quot; untuk memulai.
          </div>
        ) : (
          <div className="space-y-0">
            {children.map((node, idx) => (
              <TreeNodeCard
                key={`root-${idx}`}
                node={node}
                path={[idx]}
                depth={0}
                onAddChild={handleAddChild}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                onToggleType={handleToggleType}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Structure Preview ── */}
      {showPreview && (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Preview Struktur</h2>
          {children.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Belum ada komponen untuk ditampilkan.
            </div>
          ) : (
            <div className="space-y-3">
              {children.map((node, idx) => (
                <StructureCard key={idx} node={node} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleReset}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      {/* ── Error Toast ── */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all bg-red-600 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* ── Success Overlay ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Berhasil Disimpan!</h2>
                  <p className="text-xs text-gray-500">Template penilaian blok telah berhasil disimpan.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  handleReset();
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 overflow-y-auto">
              {/* ── Info ── */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Nama Struktur</span>
                  <p className="font-medium text-gray-800">{structureName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total Komponen</span>
                  <p className="font-medium text-gray-800">{children.length} komponen utama</p>
                </div>
              </div>

              {/* ── Tree Structure ── */}
              {children.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Struktur Penilaian</h3>
                  <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-2">
                    <DisplayTreeNode nodes={children} depth={0} />
                  </div>
                </div>
              )}

              {/* ── Leaf Nodes ── */}
              {getLeafNodes(children).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Komponen Penilaian (Leaf Nodes)</h3>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Nama</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 w-20">Bobot</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 w-20">Tipe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {getLeafNodes(children).map((leaf, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60">
                            <td className="px-3 py-2 text-gray-800">{leaf.name}</td>
                            <td className="px-3 py-2 text-center text-gray-600">{leaf.weight}%</td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                {leaf.type || "input"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── JSON Preview ── */}
              <details className="rounded-lg border border-gray-200">
                <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 transition">
                  Lihat JSON
                </summary>
                <div className="px-4 pb-4">
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto max-h-64">
                    {JSON.stringify(previewJson, null, 2)}
                  </pre>
                </div>
              </details>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  handleReset();
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Buat Baru
              </button>
              <button
                onClick={() => navigate("/admin/blok/master-data")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Lihat Daftar Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
