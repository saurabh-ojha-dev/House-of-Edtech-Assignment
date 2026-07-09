'use client'

/**
 * Full-featured TipTap rich-text editor component.
 * Uses @tiptap/react + @tiptap/starter-kit + underline + link extensions.
 * Pattern taken from aptify project (RenderAiGeneratedDocs) and official TipTap Next.js docs.
 */

import { useEffect, useReducer } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
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
} from 'lucide-react'

// ─── Utility: force re-render on editor state changes ────────────────────────
function useEditorRerender(editor: Editor | null) {
  const [, bump] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    if (!editor) return
    const handler = () => bump()
    editor.on('selectionUpdate', handler)
    editor.on('transaction', handler)
    return () => {
      editor.off('selectionUpdate', handler)
      editor.off('transaction', handler)
    }
  }, [editor])
}

// ─── Toolbar ────────────────────────────────────────────────────────────────
function EditorToolbar({ editor }: { editor: Editor }) {
  useEditorRerender(editor)

  const btn = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors duration-150 disabled:opacity-40 ${active
      ? 'bg-indigo-100 text-indigo-700'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`

  const sep = <div className="mx-1 h-6 w-px shrink-0 bg-slate-200" />

  // Heading select value
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
    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2 rounded-t-xl">
      {/* Heading */}
      <select
        aria-label="Text style"
        className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400/50 min-w-[5.5rem]"
        value={headingValue}
        onChange={(e) => {
          const v = e.target.value
          const chain = editor.chain().focus()
          if (v === 'p') {
            chain.setParagraph().run()
          } else {
            chain.toggleHeading({ level: Number(v) as 1 | 2 | 3 }).run()
          }
        }}
      >
        <option value="p">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      {sep}

      {/* Text formatting */}
      <button type="button" title="Bold" className={btn(editor.isActive('bold'))}
        onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={15} strokeWidth={2.25} />
      </button>
      <button type="button" title="Italic" className={btn(editor.isActive('italic'))}
        onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={15} strokeWidth={2.25} />
      </button>
      <button type="button" title="Underline" className={btn(editor.isActive('underline'))}
        onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon size={15} strokeWidth={2.25} />
      </button>
      <button type="button" title="Strikethrough" className={btn(editor.isActive('strike'))}
        onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={15} strokeWidth={2.25} />
      </button>
      <button type="button" title="Inline code" className={btn(editor.isActive('code'))}
        onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code size={15} strokeWidth={2.25} />
      </button>

      {sep}

      {/* Lists */}
      <button type="button" title="Bullet list" className={btn(editor.isActive('bulletList'))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={15} strokeWidth={2.25} />
      </button>
      <button type="button" title="Numbered list" className={btn(editor.isActive('orderedList'))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={15} strokeWidth={2.25} />
      </button>
      <button type="button" title="Blockquote" className={btn(editor.isActive('blockquote'))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={15} strokeWidth={2.25} />
      </button>

      {sep}

      {/* Link */}
      <button type="button" title="Insert / edit link" className={btn(editor.isActive('link'))}
        onClick={handleSetLink}>
        <LinkIcon size={15} strokeWidth={2.25} />
      </button>

      {sep}

      {/* Undo / Redo */}
      <button type="button" title="Undo" className={btn(false)}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}>
        <Undo size={15} strokeWidth={2.25} />
      </button>
      <button type="button" title="Redo" className={btn(false)}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}>
        <Redo size={15} strokeWidth={2.25} />
      </button>
    </div>
  )
}

// ─── Main Tiptap Component ───────────────────────────────────────────────────
const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-indigo-600 underline cursor-pointer' },
      }),
    ],
    content: `<h2>Welcome to the Local‑First Document Editor</h2>
<p>This editor works <strong>offline</strong> and syncs automatically when you reconnect. Try formatting some text using the toolbar above.</p>
<ul>
  <li>Bold, italic, underline, strikethrough</li>
  <li>Headings (H1 – H3)</li>
  <li>Bullet &amp; numbered lists</li>
  <li>Blockquotes and inline code</li>
</ul>`,
    // Required for Next.js – prevents SSR/hydration mismatch
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] px-6 py-5 text-slate-800',
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

export default Tiptap
