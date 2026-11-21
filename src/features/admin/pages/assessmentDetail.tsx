import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/components/ui/Button";
import AssignDosenAssessmentModal from "../components/organisms/AssignDosenAssessmentModal";
import type { AvailableAssessmentNode } from "../components/organisms/AssignDosenAssessmentModal";
import {
  getKelas,
  getAssessmentDosenAssignments,
  setupAssessmentDosen,
} from "@/features/admin/api/assessment";
import { getDetailTemplateBlok } from "@/features/admin/api/masterData";
import type {
  StaffKelasItem,
  AssessmentDosenAssignmentData,
  AssessmentDosenAssignmentItem,
  TemplateBlokTreeNode,
} from "@/features/admin/types";

// ─── Types untuk Struktur Node Assessment ──────────────────────────────────────

interface AssessmentTreeNode {
  key: string;
  name: string;
  weight: number;
  type?: string;
  children?: AssessmentTreeNode[];
}

interface AssessmentNodeCardProps {
  node: AssessmentTreeNode;
  depth?: number;
  getDosen: (key: string) => {
    kode_dosen: number | string;
    nama_dosen: string;
    nik?: string;
    alamat_email?: string;
  } | null;
  onOpenAssign: (nodeKey: string, currentKodeDosen?: number | string) => void;
}

/**
 * Komponen Node Pohon Struktur Penilaian (Gaya Master Data Blok)
 * Menampilkan nama node, bobot, tipe, dan di bawahnya menampilkan dosen penilainya.
 */
function AssessmentNodeCard({
  node,
  depth = 0,
  getDosen,
  onOpenAssign,
}: AssessmentNodeCardProps) {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isTopLevel = depth === 0;
  const dosen = getDosen(node.key);

  return (
    <div className={isTopLevel ? "" : "ml-6 mt-3"}>
      <div
        className={`rounded-xl border ${
          isTopLevel
            ? "border-blue-200 bg-blue-50/30"
            : "border-gray-200 bg-white"
        } p-4 shadow-2xs hover:border-brand-200 transition-colors`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {hasChildren ? (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-gray-800">
                  {node.name || formatNodeKey(node.key)}
                </h3>
                {node.key && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                    {node.key}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Bobot: {node.weight}%
                {node.type && ` • Tipe: ${node.type}`}
              </p>
            </div>
          </div>
          {hasChildren && (
            <span className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
              {node.children!.length} sub-komponen
            </span>
          )}
        </div>

        {/* ─── Di Bawah Node: Tampilkan Dosen Penilainya ─── */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          {dosen ? (
            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap bg-gray-50/80 rounded-xl p-2.5 border border-gray-200/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs shrink-0 border border-brand-200 shadow-2xs">
                  {dosen.nama_dosen
                    ? dosen.nama_dosen
                        .replace(/^dr\.\s*/i, "")
                        .split(" ")
                        .filter(Boolean)
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "DP"}
                </div>
                <div className="min-w-0 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Dosen Penilai:
                    </span>
                    <span className="font-bold text-gray-900 truncate">
                      {dosen.nama_dosen}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200 shrink-0">
                      Kode: {dosen.kode_dosen}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
                    {dosen.nik && dosen.nik !== "-" && (
                      <span>NIK: {dosen.nik}</span>
                    )}
                    {dosen.nik &&
                      dosen.nik !== "-" &&
                      dosen.alamat_email &&
                      dosen.alamat_email !== "-" && <span>•</span>}
                    {dosen.alamat_email && dosen.alamat_email !== "-" && (
                      <span className="truncate">{dosen.alamat_email}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenAssign(node.key, dosen.kode_dosen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-white hover:bg-brand-50 active:bg-brand-100 border border-brand-200 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                title="Ubah dosen penilai untuk komponen ini"
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>Ubah Dosen</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap bg-amber-50/50 rounded-xl p-2.5 border border-amber-200/70">
              <div className="flex items-center gap-2 text-amber-800 min-w-0">
                <svg
                  className="h-4 w-4 text-amber-600 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="text-[11px] font-medium text-amber-800 truncate">
                  {hasChildren
                    ? "Kategori penilaian (dosen penilai dapat dialokasikan per sub-komponen atau pada kategori ini)"
                    : "Belum ada dosen penilai yang ditugaskan pada komponen ini"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onOpenAssign(node.key)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-white hover:bg-brand-50 active:bg-brand-100 border border-brand-200 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                title="Pilih dosen penilai untuk komponen ini"
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Pilih Dosen</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {hasChildren && (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
          {node.children!.map((child, idx) => (
            <AssessmentNodeCard
              key={child.key || idx}
              node={child}
              depth={depth + 1}
              getDosen={getDosen}
              onOpenAssign={onOpenAssign}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Helper untuk memformat node_key menjadi teks yang rapi dan mudah dibaca
 */
function formatNodeKey(nodeKey: string): string {
  if (!nodeKey) return "-";
  const upperKeys: Record<string, string> = {
    osce: "OSCE",
    cbl: "CBL",
    mcq: "MCQ",
    ospe: "OSPE",
    socap: "SOCAP",
    pbl: "PBL",
  };

  const lower = nodeKey.toLowerCase();
  if (upperKeys[lower]) return upperKeys[lower];

  return nodeKey
    .replace(/[_-]/g, " ")
    .split(" ")
    .map(
      (word) =>
        upperKeys[word.toLowerCase()] ||
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}

export default function AssessmentDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { codeKelas: paramCodeKelas } = useParams<{ codeKelas: string }>();
  const [searchParams] = useSearchParams();

  // Ambil code_kelas dari berbagai kemungkinan sumber (state, params, query)
  const stateKelas = (location.state as { kelas?: StaffKelasItem })?.kelas;
  const rawCodeKelas =
    stateKelas?.code_kelas ||
    paramCodeKelas ||
    searchParams.get("code_kelas") ||
    "";
  const codeKelas = rawCodeKelas ? decodeURIComponent(rawCodeKelas) : "";

  // ─── Data States ───
  const [kelas, setKelas] = useState<StaffKelasItem | null>(stateKelas || null);
  const [assignmentData, setAssignmentData] =
    useState<AssessmentDosenAssignmentData | null>(null);

  // ─── Loading & Error States ───
  const [loadingKelas, setLoadingKelas] = useState(!stateKelas);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [errorKelas, setErrorKelas] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // ─── Action States ───
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isAddDosenOpen, setIsAddDosenOpen] = useState(false);
  const [targetNodeKey, setTargetNodeKey] = useState<string | undefined>(undefined);
  const [targetKodeDosen, setTargetKodeDosen] = useState<number | string | undefined>(undefined);

  // ─── Toast Notifications ───
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ─── Fetch Kelas Info (dari master list kelas) ───
  const fetchKelasInfo = useCallback(async () => {
    if (!codeKelas) {
      setErrorKelas("Code kelas tidak ditemukan.");
      setLoadingKelas(false);
      return;
    }

    try {
      const res = await getKelas();
      if (res.status && Array.isArray(res.data)) {
        const found = res.data.find((k) => k.code_kelas === codeKelas);
        if (found) {
          setKelas(found);
          setErrorKelas(null);
        } else if (!stateKelas) {
          setErrorKelas("Data kelas tidak ditemukan.");
        }
      }
    } catch {
      if (!stateKelas) {
        setErrorKelas("Gagal mengambil data kelas perkuliahan.");
      }
    } finally {
      setLoadingKelas(false);
    }
  }, [codeKelas, stateKelas]);

  // ─── Fetch Assignment Dosen (GET /api/staff/assessment/dosen/assignments) ───
  const fetchAssignments = useCallback(async (targetCode: string) => {
    if (!targetCode) return;
    setLoadingAssignments(true);
    setAssignmentError(null);

    const res = await getAssessmentDosenAssignments(targetCode);
    if (!res.status) {
      setAssignmentError(res.message || "Gagal memuat assignment dosen penilai.");
      setAssignmentData(null);
    } else {
      setAssignmentData(res.data || null);
    }
    setLoadingAssignments(false);
  }, []);

  // Inisialisasi data saat pertama kali render
  useEffect(() => {
    fetchKelasInfo();
  }, [fetchKelasInfo]);

  useEffect(() => {
    if (codeKelas) {
      fetchAssignments(codeKelas);
    }
  }, [codeKelas, fetchAssignments]);

  // ─── Refresh Semua Data ───
  const handleRefreshAll = () => {
    fetchKelasInfo();
    if (codeKelas) {
      fetchAssignments(codeKelas);
    }
  };

  // ─── Ekstraksi Penugasan Aktif (Assignments / payload_sample_put) ───
  const activeAssignments = useMemo<AssessmentDosenAssignmentItem[]>(() => {
    if (Array.isArray(assignmentData?.assignments) && assignmentData.assignments.length > 0) {
      return assignmentData.assignments;
    }
    if (
      assignmentData?.payload_sample_put &&
      Array.isArray(assignmentData.payload_sample_put.assignments) &&
      assignmentData.payload_sample_put.assignments.length > 0
    ) {
      return assignmentData.payload_sample_put.assignments.map((item, idx) => ({
        id: idx + 1,
        node_key: item.node_key,
        kode_dosen: item.kode_dosen,
      }));
    }
    return [];
  }, [assignmentData]);

  // ─── Ekstraksi Daftar Dosen Penilai (Referensi Kode Dosen dari Dosen Pengajar) ───
  const dosenPenilaiList = useMemo(() => {
    const dosenMap = new Map<
      string,
      {
        kode_dosen: number | string;
        nama_dosen: string;
        nik?: string;
        alamat_email?: string;
        assigned_nodes: string[];
      }
    >();

    activeAssignments.forEach((item) => {
      const kodeKey = String(item.kode_dosen);
      // Ambil referensi dosen dari dosen_pengajar
      const refDosen = (assignmentData?.dosen_pengajar || []).find(
        (dp) => String(dp.kode_dosen) === kodeKey
      );

      const existing = dosenMap.get(kodeKey);
      const nodeKey = item.node_key;

      if (existing) {
        if (nodeKey && !existing.assigned_nodes.includes(nodeKey)) {
          existing.assigned_nodes.push(nodeKey);
        }
      } else {
        dosenMap.set(kodeKey, {
          kode_dosen: item.kode_dosen,
          nama_dosen: refDosen?.nama_dosen || item.nama_dosen || `Dosen #${item.kode_dosen}`,
          nik: refDosen?.nik || item.nik,
          alamat_email: refDosen?.alamat_email || item.alamat_email,
          assigned_nodes: nodeKey ? [nodeKey] : [],
        });
      }
    });

    return Array.from(dosenMap.values());
  }, [activeAssignments, assignmentData?.dosen_pengajar]);

  // ─── Ekstraksi Daftar Komponen Penilaian Tersedia (available_nodes / assignments / payload_sample_put) ───
  const availableNodeList = useMemo<AvailableAssessmentNode[]>(() => {
    const nodeMap = new Map<string, AvailableAssessmentNode>();

    // 1. Dari available_nodes jika ada dari API
    if (Array.isArray(assignmentData?.available_nodes)) {
      assignmentData.available_nodes.forEach((n) => {
        if (n.node_key) {
          const matchDosen = (assignmentData?.dosen_pengajar || []).find(
            (d) => String(d.kode_dosen) === String(n.assigned_dosen)
          );
          nodeMap.set(n.node_key, {
            node_key: n.node_key,
            name: n.name || formatNodeKey(n.node_key),
            assigned_dosen: n.assigned_dosen,
            assigned_dosen_name: matchDosen?.nama_dosen,
          });
        }
      });
    }

    // 2. Dari activeAssignments (daftar penugasan yang sudah ada)
    activeAssignments.forEach((a) => {
      if (a.node_key && !nodeMap.has(a.node_key)) {
        nodeMap.set(a.node_key, {
          node_key: a.node_key,
          name: formatNodeKey(a.node_key),
          assigned_dosen: a.kode_dosen,
          assigned_dosen_name: a.nama_dosen,
        });
      }
    });

    // 3. Dari payload_sample_put jika ada
    if (Array.isArray(assignmentData?.payload_sample_put?.assignments)) {
      assignmentData.payload_sample_put.assignments.forEach((a) => {
        if (a.node_key && !nodeMap.has(a.node_key)) {
          const matchDosen = (assignmentData?.dosen_pengajar || []).find(
            (d) => String(d.kode_dosen) === String(a.kode_dosen)
          );
          nodeMap.set(a.node_key, {
            node_key: a.node_key,
            name: formatNodeKey(a.node_key),
            assigned_dosen: a.kode_dosen,
            assigned_dosen_name: matchDosen?.nama_dosen,
          });
        }
      });
    }

    return Array.from(nodeMap.values());
  }, [assignmentData, activeAssignments]);

  // ─── View Mode: Struktur Node (Pohon) vs Tabel ───
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");

  // ─── Fetch Template Structure jika belum ada di assignmentData ───
  const [templateTree, setTemplateTree] = useState<TemplateBlokTreeNode[]>([]);
  const [loadingTemplateTree, setLoadingTemplateTree] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkTemplate() {
      // Jika assignmentData sudah punya tree atau structure, tidak perlu fetch
      if (
        (assignmentData?.tree && (Array.isArray(assignmentData.tree) ? assignmentData.tree.length > 0 : true)) ||
        assignmentData?.structure ||
        assignmentData?.tree_view
      ) {
        return;
      }

      // Cek apakah ada template_id di assignmentData
      const templateCode = assignmentData?.template?.template_id;
      if (!templateCode) return;

      setLoadingTemplateTree(true);
      try {
        const res = await getDetailTemplateBlok(templateCode);
        if (!cancelled && res.status && res.data) {
          const apiData = res.data;
          let nodes: TemplateBlokTreeNode[] = [];
          if (Array.isArray(apiData.tree)) {
            nodes = apiData.tree;
          } else if (apiData.tree && typeof apiData.tree === "object") {
            nodes = [apiData.tree as TemplateBlokTreeNode];
          } else if (apiData.structure) {
            nodes = [apiData.structure];
          }
          setTemplateTree(nodes);
        }
      } catch {
        // Abaikan jika tidak dapat di-fetch
      } finally {
        if (!cancelled) setLoadingTemplateTree(false);
      }
    }

    if (assignmentData) {
      checkTemplate();
    }

    return () => {
      cancelled = true;
    };
  }, [assignmentData]);

  // ─── Ekstraksi Pohon Struktur Penilaian (Assessment Tree) ───
  const assessmentTree = useMemo<AssessmentTreeNode[]>(() => {
    function normalizeRawNode(raw: unknown): AssessmentTreeNode | null {
      if (!raw || typeof raw !== "object") return null;
      const r = raw as Record<string, unknown>;
      const key = String(r.key || r.node_key || r.id || "");
      const name = String(r.name || (key ? formatNodeKey(key) : "Komponen"));
      const weight = Number(r.weight ?? r.bobot ?? 0);
      const type = r.type ? String(r.type) : undefined;

      let children: AssessmentTreeNode[] | undefined = undefined;
      const rawChildren = r.children || r.sub_components || r.nodes;
      if (Array.isArray(rawChildren) && rawChildren.length > 0) {
        children = rawChildren
          .map(normalizeRawNode)
          .filter((c): c is AssessmentTreeNode => c !== null);
      }

      return {
        key,
        name,
        weight,
        type: type || (children && children.length > 0 ? "category" : "leaf"),
        children,
      };
    }

    // 1. Dari templateTree (jika di-fetch)
    if (templateTree.length > 0) {
      return templateTree
        .map(normalizeRawNode)
        .filter((c): c is AssessmentTreeNode => c !== null);
    }

    // 2. Dari assignmentData.tree
    if (Array.isArray(assignmentData?.tree) && assignmentData.tree.length > 0) {
      return assignmentData.tree
        .map(normalizeRawNode)
        .filter((c): c is AssessmentTreeNode => c !== null);
    } else if (assignmentData?.tree && typeof assignmentData.tree === "object") {
      const single = normalizeRawNode(assignmentData.tree);
      if (single) return [single];
    }

    // 3. Dari assignmentData.structure
    if (assignmentData?.structure) {
      if (Array.isArray(assignmentData.structure)) {
        return assignmentData.structure
          .map(normalizeRawNode)
          .filter((c): c is AssessmentTreeNode => c !== null);
      } else if (typeof assignmentData.structure === "object") {
        const single = normalizeRawNode(assignmentData.structure);
        if (single) return [single];
      }
    }

    // 4. Dari assignmentData.tree_view
    if (assignmentData?.tree_view) {
      if (Array.isArray(assignmentData.tree_view)) {
        return assignmentData.tree_view
          .map(normalizeRawNode)
          .filter((c): c is AssessmentTreeNode => c !== null);
      } else if (typeof assignmentData.tree_view === "object") {
        const single = normalizeRawNode(assignmentData.tree_view);
        if (single) return [single];
      }
    }

    // 5. Dari assignmentData.template (tree atau structure)
    if (assignmentData?.template) {
      const t = assignmentData.template as Record<string, unknown>;
      if (Array.isArray(t.tree)) {
        return t.tree
          .map(normalizeRawNode)
          .filter((c): c is AssessmentTreeNode => c !== null);
      }
      if (t.structure && typeof t.structure === "object") {
        const single = normalizeRawNode(t.structure);
        if (single) return [single];
      }
    }

    // 6. Dari available_nodes
    if (Array.isArray(assignmentData?.available_nodes) && assignmentData.available_nodes.length > 0) {
      return assignmentData.available_nodes.map((n) => ({
        key: n.node_key,
        name: n.name || formatNodeKey(n.node_key),
        weight: Number(n.weight || 0),
        type: n.type || (n.sub_components && n.sub_components.length > 0 ? "category" : "leaf"),
        children:
          Array.isArray(n.sub_components) && n.sub_components.length > 0
            ? n.sub_components.map((sub) => ({
                key: sub.key,
                name: sub.name || formatNodeKey(sub.key),
                weight: Number(sub.weight || 0),
                type: "leaf",
              }))
            : undefined,
      }));
    }

    // 7. Fallback dari activeAssignments
    if (activeAssignments.length > 0) {
      return activeAssignments.map((a) => ({
        key: a.node_key,
        name: formatNodeKey(a.node_key),
        weight: 0,
        type: "leaf",
      }));
    }

    return [];
  }, [templateTree, assignmentData, activeAssignments]);

  // ─── Helper untuk mendapatkan Dosen Penilai untuk suatu Node ───
  const getDosenForNode = useCallback(
    (nodeKey: string) => {
      if (!nodeKey) return null;
      const lowerKey = nodeKey.toLowerCase();

      // 1. Cari dari activeAssignments
      const matchAssignment = activeAssignments.find(
        (a) => a.node_key === nodeKey || (a.node_key && a.node_key.toLowerCase() === lowerKey)
      );

      // 2. Cari dari available_nodes jika ada
      const availNode = assignmentData?.available_nodes?.find(
        (n) => n.node_key === nodeKey || (n.node_key && n.node_key.toLowerCase() === lowerKey)
      );

      const kodeDosen = matchAssignment?.kode_dosen ?? availNode?.assigned_dosen;

      if (kodeDosen === undefined || kodeDosen === null || kodeDosen === "" || kodeDosen === 0) {
        return null;
      }

      // 3. Referensi dosen dari dosen_pengajar
      const refDosen = (assignmentData?.dosen_pengajar || []).find(
        (dp) => String(dp.kode_dosen) === String(kodeDosen)
      );

      const namaDosen =
        refDosen?.nama_dosen ||
        matchAssignment?.nama_dosen ||
        (availNode as unknown as { assigned_dosen_name?: string })?.assigned_dosen_name ||
        `Dosen #${kodeDosen}`;

      const nik = refDosen?.nik || matchAssignment?.nik || "-";
      const email = refDosen?.alamat_email || matchAssignment?.alamat_email || "-";

      return {
        kode_dosen: kodeDosen,
        nama_dosen: namaDosen,
        nik,
        alamat_email: email,
      };
    },
    [activeAssignments, assignmentData?.available_nodes, assignmentData?.dosen_pengajar]
  );

  // ─── Identifikasi Node Tertinggi (Root Node) ───
  const rootNodeInfo = useMemo<{ key: string; name: string } | null>(() => {
    // 1. Dari template?.root_key
    if (assignmentData?.template?.root_key) {
      return {
        key: assignmentData.template.root_key,
        name:
          assignmentData.template.root_name ||
          formatNodeKey(assignmentData.template.root_key),
      };
    }
    // 2. Dari node pertama di assessmentTree
    if (assessmentTree.length > 0 && assessmentTree[0]?.key) {
      return {
        key: assessmentTree[0].key,
        name: assessmentTree[0].name || formatNodeKey(assessmentTree[0].key),
      };
    }
    // 3. Dari node pertama di templateTree
    if (templateTree.length > 0 && templateTree[0]?.key) {
      return {
        key: templateTree[0].key,
        name: templateTree[0].name || formatNodeKey(templateTree[0].key),
      };
    }
    // 4. Dari available_nodes
    const categoryNode = assignmentData?.available_nodes?.find(
      (n) => n.type === "category" || (n.sub_components && n.sub_components.length > 0)
    );
    if (categoryNode?.node_key) {
      return {
        key: categoryNode.node_key,
        name: categoryNode.name || formatNodeKey(categoryNode.node_key),
      };
    }
    return null;
  }, [assignmentData?.template, assessmentTree, templateTree, assignmentData?.available_nodes]);

  // ─── Koordinator Blok: Tepat Satu Dosen pada Node Tertinggi ───
  const koordinatorBlok = useMemo<{
    kode_dosen: number | string;
    nama_dosen: string;
    nik?: string;
    alamat_email?: string;
    node_key: string;
    node_name: string;
  } | null>(() => {
    // 1. Cek dosen yang dialokasikan langsung pada rootNodeInfo.key
    if (rootNodeInfo?.key) {
      const matchRoot = getDosenForNode(rootNodeInfo.key);
      if (matchRoot) {
        return {
          ...matchRoot,
          node_key: rootNodeInfo.key,
          node_name: rootNodeInfo.name,
        };
      }
    }

    // 2. Cek dosen pada top-level nodes di assessmentTree
    for (const topNode of assessmentTree) {
      const matchTop = getDosenForNode(topNode.key);
      if (matchTop) {
        return {
          ...matchTop,
          node_key: topNode.key,
          node_name: topNode.name || formatNodeKey(topNode.key),
        };
      }
    }

    // 3. Fallback: jika belum ada dosen pada root node secara eksplisit, ambil dosen pertama dari dosenPenilaiList
    if (dosenPenilaiList.length > 0) {
      const first = dosenPenilaiList[0];
      const targetKey = rootNodeInfo?.key || first.assigned_nodes[0] || "";
      return {
        kode_dosen: first.kode_dosen,
        nama_dosen: first.nama_dosen,
        nik: first.nik,
        alamat_email: first.alamat_email,
        node_key: targetKey,
        node_name: rootNodeInfo?.name || (targetKey ? formatNodeKey(targetKey) : "Node Utama"),
      };
    }

    return null;
  }, [rootNodeInfo, getDosenForNode, assessmentTree, dosenPenilaiList]);

  // ─── Handle Setup Assessment (POST /api/staff/assessment/dosen) ───
  const handleExecuteSetup = async () => {
    if (!codeKelas) return;

    setIsSettingUp(true);
    const res = await setupAssessmentDosen({ code_kelas: codeKelas });
    setIsSettingUp(false);

    if (!res.status) {
      setToast({
        type: "error",
        message: res.message || "Gagal menjalankan setup assessment dosen.",
      });
    } else {
      setToast({
        type: "success",
        message:
          res.message ||
          `Setup assessment untuk kelas "${kelas?.nama_kelas || assignmentData?.kelas?.nama_kelas || ""}" berhasil dijalankan!`,
      });
      // Perbarui status kelas lokal
      setKelas((prev) => (prev ? { ...prev, setup_assignments: true } : prev));
      // Refresh assignments
      fetchAssignments(codeKelas);
    }
  };

  // ─── Handle Buka Modal Penugasan Dosen (Assign / Tambah Dosen) ───
  const handleOpenAssignModal = (nodeKey?: string, kodeDosen?: number | string) => {
    const assessmentId =
      assignmentData?.assessment_dosen_id ||
      assignmentData?.payload_sample_put?.assessment_dosen_id ||
      0;

    if (!assessmentId && !isSetupAssignments) {
      setToast({
        type: "error",
        message:
          "Assessment belum di-setup. Harap jalankan 'Setup Assessment Dosen' terlebih dahulu sebelum menugaskan dosen penilai.",
      });
      return;
    }

    setTargetNodeKey(nodeKey);
    setTargetKodeDosen(kodeDosen);
    setIsAddDosenOpen(true);
  };

  // ─── Handle Penugasan Dosen Berhasil ───
  const handleAssignSuccess = (msg?: string) => {
    setToast({
      type: "success",
      message: msg || "Penugasan dosen assessment berhasil disimpan!",
    });
    setIsAddDosenOpen(false);
    setTargetNodeKey(undefined);
    setTargetKodeDosen(undefined);
    if (codeKelas) {
      fetchAssignments(codeKelas);
    }
    fetchKelasInfo();
  };

  // ─── Tampilan Jika Loading Pertama Kali ───
  if (loadingKelas && !kelas && !assignmentData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-white rounded-2xl border border-gray-100" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-white rounded-2xl border border-gray-100" />
          <div className="h-28 bg-white rounded-2xl border border-gray-100" />
          <div className="h-28 bg-white rounded-2xl border border-gray-100" />
        </div>
        <div className="h-64 bg-white rounded-2xl border border-gray-100" />
      </div>
    );
  }

  // ─── Tampilan Jika Kelas Tidak Ditemukan ───
  if (errorKelas && !kelas && !assignmentData) {
    return (
      <div className="rounded-2xl bg-white border border-rose-200 p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Kelas Tidak Ditemukan</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{errorKelas}</p>
        </div>
        <div>
          <Button variant="primary" size="sm" onClick={() => navigate("/admin/assessment")}>
            Kembali ke Daftar Assessment
          </Button>
        </div>
      </div>
    );
  }

  const hasTemplateMatakuliah = Boolean(kelas?.template_matakuliah);
  const hasTemplateAssignments = Boolean(kelas?.template_assignments);
  const isSetupAssignments = Boolean(kelas?.setup_assignments);

  const namaKelasDisplay = kelas?.nama_kelas || assignmentData?.kelas?.nama_kelas || "-";
  const namaMatakuliahDisplay =
    kelas?.nama_matakuliah || assignmentData?.kelas?.matakuliah || "Detail Assessment";
  const kodeMatakuliahDisplay =
    kelas?.kode_matakuliah || assignmentData?.kelas?.kode_matakuliah;
  const semesterDisplay = kelas?.semester || assignmentData?.kelas?.semester || "-";
  const tahunAkademikDisplay = kelas?.tahun_akademik;

  return (
    <div className="space-y-6">
      {/* ─── Toast Notification ─── */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-fadeIn">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
              toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {toast.type === "success" ? (
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-75 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ─── Navigation Header ─── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/assessment")}
            className="p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition shrink-0"
            title="Kembali ke Daftar Assessment"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                Kelas {namaKelasDisplay}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-semibold text-gray-500">
                Semester {semesterDisplay}
              </span>
              {tahunAkademikDisplay && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-semibold text-gray-500">
                    T.A. {tahunAkademikDisplay}
                  </span>
                </>
              )}
              {kodeMatakuliahDisplay && (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                  {kodeMatakuliahDisplay}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 leading-snug">
              {namaMatakuliahDisplay}
            </h1>

            <p className="text-xs text-gray-500 font-mono truncate max-w-xl" title={codeKelas}>
              Code Kelas: {codeKelas}
            </p>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={loadingAssignments}
            className="flex items-center gap-1.5 text-xs"
          >
            <svg
              className={`h-3.5 w-3.5 ${loadingAssignments ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Segarkan</span>
          </Button>

          {/* Button Tambah Dosen (Wajib Selalu Ada di Halaman Detail) */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenAssignModal()}
            className="flex items-center gap-1.5 text-xs shadow-xs"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Tambah Dosen</span>
          </Button>
        </div>
      </div>

      {/* ─── Status Overview Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Status 1: Template Matakuliah */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-medium">Template Matakuliah</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  hasTemplateMatakuliah ? "bg-emerald-500" : "bg-amber-400"
                }`}
              />
              <span className="text-sm font-bold text-gray-900">
                {hasTemplateMatakuliah ? "Tersedia" : "Belum Dibuat"}
              </span>
            </div>
          </div>
          <span
            className={`p-2 rounded-xl ${
              hasTemplateMatakuliah
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-amber-50 text-amber-600 border border-amber-100"
            }`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </span>
        </div>

        {/* Status 2: Template Assignments */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-medium">Template Penilaian</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  hasTemplateAssignments ? "bg-emerald-500" : "bg-amber-400"
                }`}
              />
              <span className="text-sm font-bold text-gray-900">
                {hasTemplateAssignments ? "Tersedia" : "Belum Dibuat"}
              </span>
            </div>
          </div>
          <span
            className={`p-2 rounded-xl ${
              hasTemplateAssignments
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-amber-50 text-amber-600 border border-amber-100"
            }`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </span>
        </div>

        {/* Status 3: Setup Assignments */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-medium">Setup Penilaian</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isSetupAssignments ? "bg-emerald-500" : "bg-rose-400"
                }`}
              />
              <span className="text-sm font-bold text-gray-900">
                {isSetupAssignments ? "Sudah Setup" : "Belum Setup"}
              </span>
            </div>
          </div>
          <span
            className={`p-2 rounded-xl ${
              isSetupAssignments
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-rose-50 text-rose-600 border border-rose-100"
            }`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </span>
        </div>
      </div>

      {/* ─── Banner Action Setup Assessment Jika Belum Setup ─── */}
      {!isSetupAssignments && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Inisialisasi Setup Assessment Dosen
              </h3>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Penilaian untuk kelas ini belum di-setup. Jalankan setup untuk menginisialisasi alokasi penilaian dosen ke masing-masing node penilaian.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExecuteSetup}
            disabled={isSettingUp}
            className="flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            {isSettingUp ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Menjalankan Setup...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>Jalankan Setup Assessment</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* ─── SECTION 1: Koordinator Blok (Satu Dosen pada Node Tertinggi) ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Koordinator Blok
              </h2>
              <p className="text-[11px] text-gray-500">
                Dosen penanggung jawab utama pada node penilaian tertinggi kelas ini
              </p>
            </div>
            {koordinatorBlok ? (
              <span className="ml-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                1 Koordinator
              </span>
            ) : (
              <span className="ml-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Belum Ditugaskan
              </span>
            )}
          </div>

          {koordinatorBlok ? (
            <button
              type="button"
              onClick={() => handleOpenAssignModal(koordinatorBlok.node_key, koordinatorBlok.kode_dosen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-white hover:bg-brand-50 active:bg-brand-100 border border-brand-200 rounded-lg shadow-2xs transition-all cursor-pointer select-none"
              title="Ubah koordinator blok untuk node tertinggi"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Ubah Koordinator</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenAssignModal(rootNodeInfo?.key)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-900 rounded-lg shadow-2xs transition-all cursor-pointer select-none"
              title="Tugaskan dosen sebagai koordinator blok"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Tugaskan Koordinator</span>
            </button>
          )}
        </div>

        <div className="p-6">
          {loadingAssignments ? (
            <div className="h-28 bg-gray-50 rounded-2xl animate-pulse" />
          ) : !koordinatorBlok ? (
            <div className="p-8 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50 space-y-3">
              <svg className="h-9 w-9 text-gray-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  Belum ada koordinator blok yang ditugaskan pada node tertinggi kelas ini
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 max-w-sm mx-auto">
                  Tugaskan dosen pengampu pada komponen penilaian root/tertinggi untuk ditetapkan sebagai Koordinator Blok.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAssignModal(rootNodeInfo?.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-900 rounded-lg shadow-2xs transition-all cursor-pointer select-none"
              >
                + Tugaskan Koordinator Blok
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50/50 via-white to-white p-5 shadow-2xs transition">
              <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-14 w-14 rounded-2xl bg-brand-700 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs border border-brand-800">
                    {koordinatorBlok.nama_dosen
                      ? koordinatorBlok.nama_dosen
                          .replace(/^dr\.\s*/i, "")
                          .split(" ")
                          .filter(Boolean)
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "KB"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-800 border border-brand-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                        Koordinator Utama
                      </span>
                      {koordinatorBlok.node_name && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          Node: {koordinatorBlok.node_name}
                          {koordinatorBlok.node_key && ` (${koordinatorBlok.node_key})`}
                        </span>
                      )}
                    </div>

                    <h3
                      className="text-base font-extrabold text-gray-900 truncate"
                      title={koordinatorBlok.nama_dosen}
                    >
                      {koordinatorBlok.nama_dosen}
                    </h3>

                    <div className="flex items-center gap-2.5 text-xs text-gray-500 mt-1 flex-wrap">
                      {koordinatorBlok.nik && koordinatorBlok.nik !== "-" && (
                        <span>
                          NIK: <span className="font-mono font-medium text-gray-700">{koordinatorBlok.nik}</span>
                        </span>
                      )}
                      {koordinatorBlok.nik && koordinatorBlok.nik !== "-" && <span>•</span>}
                      <span>
                        Kode Dosen:{" "}
                        <span className="font-mono font-semibold text-brand-800">
                          {koordinatorBlok.kode_dosen}
                        </span>
                      </span>
                      {koordinatorBlok.alamat_email && koordinatorBlok.alamat_email !== "-" && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-gray-600 truncate">
                            {koordinatorBlok.alamat_email}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenAssignModal(koordinatorBlok.node_key, koordinatorBlok.kode_dosen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-white hover:bg-brand-50 active:bg-brand-100 border border-brand-200 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                    title="Ubah koordinator blok"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Ubah Koordinator</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── SECTION 2: Daftar Penugasan Assessment Dosen (Struktur Node & Tabel) ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Daftar Penugasan Node Penilaian (Komponen Assessment)
              </h2>
              <p className="text-[11px] text-gray-500">
                Alokasi koordinator blok untuk setiap komponen penilaian
              </p>
            </div>
            {assignmentData?.assessment_dosen_id && (
              <span className="ml-1 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-gray-100 text-gray-700">
                Assessment ID #{assignmentData.assessment_dosen_id}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* View Mode Switcher */}
            <div className="inline-flex items-center p-0.5 bg-gray-100 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode("tree")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === "tree"
                    ? "bg-white text-brand-700 shadow-2xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Tampilkan Struktur Node Penilaian (Pohon Hierarkis)"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>Struktur Node</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-brand-700 shadow-2xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Tampilkan Format Tabel Penugasan"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M3 15h18M9 3v18" />
                </svg>
                <span>Tabel</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => fetchAssignments(codeKelas)}
              disabled={loadingAssignments}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 select-none"
            >
              <svg
                className={`h-3.5 w-3.5 ${loadingAssignments ? "animate-spin text-brand-600" : "text-gray-500"}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* Assignment Error Alert */}
        {assignmentError && (
          <div className="mx-6 mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-center justify-between">
            <span>{assignmentError}</span>
            <button
              type="button"
              onClick={() => fetchAssignments(codeKelas)}
              className="font-bold underline text-rose-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        <div className="p-6">
          {loadingAssignments || loadingTemplateTree ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : assessmentTree.length === 0 && activeAssignments.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50 space-y-3">
              <svg
                className="h-9 w-9 text-gray-400 mx-auto"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  Belum Ada Data Assignment Dosen
                </p>
                <p className="text-[11px] text-gray-500 max-w-sm mx-auto mt-0.5">
                  Klik tombol <strong>&quot;Jalankan Setup Assessment&quot;</strong> di atas untuk menginisialisasi alokasi penilaian dosen ke masing-masing komponen.
                </p>
              </div>
              {!isSetupAssignments && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExecuteSetup}
                  disabled={isSettingUp}
                  className="text-xs"
                >
                  Jalankan Setup Assessment
                </Button>
              )}
            </div>
          ) : viewMode === "tree" ? (
            <div className="space-y-3">
              {assessmentTree.map((node, idx) => (
                <AssessmentNodeCard
                  key={node.key || idx}
                  node={node}
                  depth={0}
                  getDosen={getDosenForNode}
                  onOpenAssign={(nodeKey, curKode) => handleOpenAssignModal(nodeKey, curKode)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Komponen Penilaian</th>
                    <th className="py-3 px-4">Kode Dosen</th>
                    <th className="py-3 px-4">Nama Koordinator Blok</th>
                    <th className="py-3 px-4">NIK</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {activeAssignments.map((item, idx) => {
                    const refDosen = (assignmentData?.dosen_pengajar || []).find(
                      (d) => String(d.kode_dosen) === String(item.kode_dosen)
                    );
                    const namaDosen =
                      refDosen?.nama_dosen || item.nama_dosen || `Dosen #${item.kode_dosen}`;
                    const nik = refDosen?.nik || item.nik || "-";
                    const email = refDosen?.alamat_email || item.alamat_email || "-";

                    return (
                      <tr key={item.id ?? `${item.node_key}-${item.kode_dosen}-${idx}`} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-gray-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-gray-900">
                              {formatNodeKey(item.node_key)}
                            </span>
                            <p className="font-mono text-[10px] text-gray-400">
                              {item.node_key}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-700 font-semibold">
                          {item.kode_dosen}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {namaDosen}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                          {nik}
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                          {email}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(item.node_key, item.kode_dosen)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition"
                            title="Pilih atau ubah koordinator blok untuk komponen ini"
                          >
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            <span>Pilih Dosen</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Modal Penugasan Dosen Assessment (PUT /api/staff/assessment/dosen/assign) ─── */}
      {isAddDosenOpen && (
        <AssignDosenAssessmentModal
          isOpen={isAddDosenOpen}
          onClose={() => {
            setIsAddDosenOpen(false);
            setTargetNodeKey(undefined);
            setTargetKodeDosen(undefined);
          }}
          onSuccess={handleAssignSuccess}
          assessmentDosenId={
            assignmentData?.assessment_dosen_id ||
            assignmentData?.payload_sample_put?.assessment_dosen_id ||
            0
          }
          namaKelas={namaKelasDisplay}
          namaMatakuliah={namaMatakuliahDisplay}
          dosenPengajarList={assignmentData?.dosen_pengajar || []}
          availableNodes={availableNodeList}
          initialNodeKey={targetNodeKey}
          initialKodeDosen={targetKodeDosen}
        />
      )}
    </div>
  );
}
