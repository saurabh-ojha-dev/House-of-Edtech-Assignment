'use client'

import dynamic from 'next/dynamic'

const CollaborativeEditor = dynamic(
  () => import('@/components/CollaborativeEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <span className="ml-3 text-slate-500 text-sm">Loading editor…</span>
      </div>
    ),
  }
)

export default function EditorLoader() {
  return <CollaborativeEditor />
}
