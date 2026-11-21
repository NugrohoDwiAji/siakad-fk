interface TreeNode {
  key?: string;
  name: string;
  weight: number;
  type?: string;
  children?: TreeNode[];
}

interface StructureCardProps {
  node: TreeNode;
  depth?: number;
}

export default function StructureCard({ node, depth = 0 }: StructureCardProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isTopLevel = depth === 0;

  return (
    <div className={`${isTopLevel ? "" : "ml-6 mt-2"}`}>
      <div className={`rounded-xl border ${isTopLevel ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-white"} p-4`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-800">{node.name || "(Tanpa nama)"}</h3>
              <p className="text-xs text-gray-500">
                Bobot: {node.weight}%
                {node.type && ` \u2022 Tipe: ${node.type}`}
              </p>
            </div>
          </div>
          {hasChildren && (
            <span className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
              {node.children!.length} sub-komponen
            </span>
          )}
        </div>
      </div>
      {hasChildren && (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
          {node.children!.map((child, idx) => (
            <StructureCard key={child.key || idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
