interface EditableTreeNode {
  key?: string;
  name: string;
  weight: number;
  type?: string;
  children?: EditableTreeNode[];
}

interface EditableStructureCardProps {
  node: EditableTreeNode;
  depth?: number;
  onUpdate: (path: number[], updates: Partial<EditableTreeNode>) => void;
  onAddChild: (path: number[]) => void;
  onRemove: (path: number[]) => void;
  onToggleType: (path: number[]) => void;
  path: number[];
}

export default function EditableStructureCard({
  node,
  depth = 0,
  onUpdate,
  onAddChild,
  onRemove,
  onToggleType,
  path,
}: EditableStructureCardProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isTopLevel = depth === 0;
  const isLeaf = !hasChildren;

  return (
    <div className={`${isTopLevel ? "" : "ml-6 mt-2"}`}>
      <div className={`rounded-xl border ${isTopLevel ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-white"} p-4`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {hasChildren ? (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-2">
              <input
                type="text"
                value={node.name}
                onChange={(e) => onUpdate(path, { name: e.target.value })}
                placeholder="Nama komponen"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={node.weight || ""}
                    onChange={(e) => onUpdate(path, { weight: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    placeholder="0"
                    className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 text-center outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  />
                  <span className="text-xs text-gray-500">%</span>
                </div>
                {isLeaf && (
                  <button
                    onClick={() => onToggleType(path)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      node.type === "input"
                        ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {node.type === "input" ? "Input" : "Header"}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onAddChild(path)}
              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
              title="Tambah child"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {!isTopLevel && (
              <button
                onClick={() => onRemove(path)}
                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition"
                title="Hapus"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      {hasChildren && (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
          {node.children!.map((child, idx) => (
            <EditableStructureCard
              key={child.key || idx}
              node={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onRemove={onRemove}
              onToggleType={onToggleType}
              path={[...path, idx]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
