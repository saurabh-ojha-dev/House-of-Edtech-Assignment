import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface EditorProps {
  ydoc: Y.Doc;
  provider: WebsocketProvider | null;
}

// Generates a random color and name for the collaborative cursor
const colors = ['#958DF1', '#F98181', '#FBCE76', '#8EA8C3', '#A4E1B0', '#F29F4D', '#9A6B6B'];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
const getRandomName = () => `User ${Math.floor(Math.random() * 100)}`;

export default function Editor({ ydoc, provider }: EditorProps) {
  const [currentUser] = useState({
    name: getRandomName(),
    color: getRandomColor(),
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // @ts-expect-error Tiptap v3 StarterKit types might not include history
        history: false, // History is handled by Yjs
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: currentUser,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[500px]',
      },
    },
  });

  // Small delay or loading state could be added here if needed

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex space-x-2">
          {/* Toolbar could go here */}
          <span className="text-sm font-semibold text-gray-600">Collaborative Editor</span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: currentUser.color }}
          ></span>
          {currentUser.name}
        </div>
      </div>
      <div className="p-4 cursor-text min-h-[60vh]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
