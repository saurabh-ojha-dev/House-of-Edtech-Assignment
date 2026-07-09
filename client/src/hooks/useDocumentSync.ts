import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

export function useDocumentSync(roomName: string = 'edtech-document') {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    // 1. Initialize Yjs document
    const doc = new Y.Doc();
    setYdoc(doc);

    // 2. Initialize IndexedDB persistence (Local-First)
    // This allows the document to be loaded and saved locally, enabling offline editing.
    const persistence = new IndexeddbPersistence(roomName, doc);
    
    persistence.on('synced', () => {
      console.log('Document loaded from local IndexedDB');
    });

    // 3. Initialize WebSocket provider for syncing with the server
    // We connect to the Node.js WebSocket server we created
    const wsProvider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_WS_URL || 'wss://house-of-edtech-assignment-0th2.onrender.com',
      roomName,
      doc
    );
    setProvider(wsProvider);

    // Listen to connection status changes
    wsProvider.on('status', (event: { status: 'connecting' | 'connected' | 'disconnected' }) => {
      setStatus(event.status);
    });

    // Listen to sync events
    wsProvider.on('sync', (isSynced: boolean) => {
      setSynced(isSynced);
    });

    return () => {
      // Cleanup on unmount
      wsProvider.destroy();
      persistence.destroy();
      doc.destroy();
    };
  }, [roomName]);

  return { ydoc, provider, status, synced };
}
