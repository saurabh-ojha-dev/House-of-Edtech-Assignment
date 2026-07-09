'use client'


import { useEffect, useReducer } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useYjsDocument, type ConnectionStatus } from '@/hooks/useYjsDocument'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Link as LinkIcon,
  Wifi,
  WifiOff,
  Loader2,
  HardDrive,
} from 'lucide-react'

function useEditorRerender(editor: Editor | null) {
  const [, bump] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    if (!editor) return
    const on = () => bump()
    editor.on('selectionUpdate', on)
    editor.on('transaction', on)
    return () => {
      editor.off('selectionUpdate', on)
      editor.off('transaction', on)
    }
  }, [editor])
}

function StatusBar({ status, synced }: { status: ConnectionStatus; synced: boolean }) {
  return (
    <div className="flex items-center gap-3 px-1 mb-3">
      {/* WebSocket status */}
      <div className="flex items-center gap-1.5">
        {status === 'connected' ? (
          <><Wifi size={13} className="text-emerald-500" /><span className="text-xs font-medium text-emerald-600">Connected</span></>
        ) : status === 'connecting' ? (
          <><Loader2 size={13} className="text-amber-500 animate-spin" /><span className="text-xs font-medium text-amber-600">Connecting…</span></>
        ) : (
          <><WifiOff size={13} className="text-red-400" /><span className="text-xs font-medium text-red-500">Offline</span></>
        )}
      </div>

      <span className="text-slate-300">·</span>

      {/* IndexedDB sync status */}
      <div className="flex items-center gap-1.5">
        <HardDrive size={13} className={synced ? 'text-indigo-500' : 'text-slate-400'} />
        <span className={`text-xs font-medium ${synced ? 'text-indigo-600' : 'text-slate-400'}`}>
          {synced ? 'Saved locally' : 'Saving…'}
        </span>
      </div>
    </div>
  )
}

function EditorToolbar({ editor }: { editor: Editor }) {
  useEditorRerender(editor)

  const btn = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors duration-150 disabled:opacity-40 ${active
      ? 'bg-indigo-100 text-indigo-700'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`

  const sep = <div className="mx-1 h-6 w-px shrink-0 bg-slate-200" />

  const headingValue = editor.isActive('heading', { level: 1 })
    ? '1'
    : editor.isActive('heading', { level: 2 })
      ? '2'
      : editor.isActive('heading', { level: 3 })
        ? '3'
        : 'p'

  const handleSetLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Enter URL', prev ?? 'https://')
    if (url === null) return
    if (url === '') { editor.chain().focus().unsetLink().run(); return }
    editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2 rounded-t-xl">
      <select
        aria-label="Text style"
        className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400/50 min-w-[5.5rem]"
        value={headingValue}
        onChange={(e) => {
          const v = e.target.value
          const chain = editor.chain().focus()
          v === 'p' ? chain.setParagraph().run() : chain.toggleHeading({ level: Number(v) as 1 | 2 | 3 }).run()
        }}
      >
        <option value="p">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      {sep}
      <button type="button" title="Bold" className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} strokeWidth={2.25} /></button>
      <button type="button" title="Italic" className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} strokeWidth={2.25} /></button>
      <button type="button" title="Underline" className={btn(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={15} strokeWidth={2.25} /></button>
      <button type="button" title="Strikethrough" className={btn(editor.isActive('strike'))} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={15} strokeWidth={2.25} /></button>
      <button type="button" title="Inline code" className={btn(editor.isActive('code'))} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={15} strokeWidth={2.25} /></button>

      {sep}
      <button type="button" title="Bullet list" className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} strokeWidth={2.25} /></button>
      <button type="button" title="Numbered list" className={btn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} strokeWidth={2.25} /></button>
      <button type="button" title="Blockquote" className={btn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={15} strokeWidth={2.25} /></button>

      {sep}
      <button type="button" title="Insert / edit link" className={btn(editor.isActive('link'))} onClick={handleSetLink}><LinkIcon size={15} strokeWidth={2.25} /></button>

      {sep}
      <button type="button" title="Undo" className={btn(false)} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo size={15} strokeWidth={2.25} /></button>
      <button type="button" title="Redo" className={btn(false)} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo size={15} strokeWidth={2.25} /></button>
    </div>
  )
}

function EditorCore({ ydoc }: { ydoc: Y.Doc }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // ⚠️ In TipTap v3, StarterKit uses 'undoRedo' (not 'history').
        // MUST disable it — Collaboration provides its own Yjs-based undo/redo stack.
        undoRedo: false,
        heading: { levels: [1, 2, 3] },
        // TipTap v3 StarterKit includes Link & Underline by default.
        // Disable them here since we add them below with custom configuration.
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-indigo-600 underline cursor-pointer' },
      }),
      // Binds the ProseMirror document state to the shared Yjs Y.Doc
      Collaboration.configure({ document: ydoc }),
    ],
    // Required for Next.js to prevent SSR hydration mismatches
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] px-6 py-5 text-slate-800',
      },
    },
  })

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {editor && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}

export default function CollaborativeEditor() {
  const { ydoc, provider, status, synced } = useYjsDocument('edtech-document-v1')

  if (!ydoc || !provider) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
        <span className="ml-3 text-slate-500 text-sm">Initializing document…</span>
      </div>
    )
  }

  return (
    <div>
      <StatusBar status={status} synced={synced} />
      <EditorCore ydoc={ydoc} />
    </div>
  )
}
