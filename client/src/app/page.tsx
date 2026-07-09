import EditorLoader from '@/components/EditorLoader'

export const metadata = {
  title: 'Local-First Document Editor | House of Edtech',
  description:
    'A production-grade local-first collaborative document editor with offline support and real-time sync.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50 flex flex-col items-center py-12 px-4">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Local‑First Document Editor
          </h1>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Edits are saved locally and sync in real-time across all open tabs · House of Edtech Assignment
        </p>
      </header>

      {/* Collaborative Editor */}
      <main className="w-full max-w-4xl mx-auto flex-grow">
        <EditorLoader />
      </main>

      <footer className="w-full max-w-4xl text-center text-xs text-slate-400 mt-8">
        Built for House of Edtech Fullstack Developer Assignment
      </footer>
    </div>
  )
}
