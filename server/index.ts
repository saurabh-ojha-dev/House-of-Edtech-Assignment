import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { MongodbPersistence } from 'y-mongodb-provider';
import * as Y from 'yjs';
import dotenv from 'dotenv';

dotenv.config();

const { setupWSConnection, setPersistence } = require('y-websocket/bin/utils');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'House of Edtech Sync Server is running.',
    mongoConnected: mongoAvailable,
  });
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const mdbUrl = process.env.MONGODB_URL;
let mdb: MongodbPersistence | null = null;
let mongoAvailable = false;

if (!mdbUrl) {
  console.warn('MONGODB_URL not set');
} else {
  try {
    mdb = new MongodbPersistence(mdbUrl, {
      collectionName: 'yjs-transactions',
      flushSize: 100,
      multipleCollections: false,
    });
    mongoAvailable = true;
    console.log('MongoDB persistence configured');
  } catch (err) {
    console.error('Failed to initialize MongoDB persistence:', err);
  }
}

setPersistence({
  bindState: async (docName: string, ydoc: any) => {
    if (!mdb) {
      console.log(`[${docName}] No MongoDB`);
      return;
    }

    try {
      const persistedYdoc = await mdb.getYDoc(docName);

      if (persistedYdoc) {
        Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
      }

      const newUpdates = Y.encodeStateAsUpdate(ydoc);
      await mdb.storeUpdate(docName, newUpdates);

      ydoc.on('update', async (update: Uint8Array) => {
        try {
          await mdb!.storeUpdate(docName, update);
        } catch (err) {
          console.error(`[${docName}] store update failed:`, err);
        }
      });

      console.log(`[${docName}] Loaded`);
    } catch (err) {
      console.error(`[${docName}] bindState error:`, (err as Error).message);
    }
  },

  writeState: async (_docName: string, _ydoc: any) => {
    return Promise.resolve();
  },
});

wss.on('connection', (ws, req) => {
  console.log(`New connection: ${req.url}`);
  setupWSConnection(ws, req);
});

const PORT = process.env.PORT || 1234;

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
