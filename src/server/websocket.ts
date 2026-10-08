import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

export const clients = new Set<WebSocket>();

export function setupWebSocket(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.send(JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() }));

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  return wss;
}

export function broadcastEvent(event: { type: string; project_id?: string; payload?: any }) {
  const message = JSON.stringify({ ...event, timestamp: new Date().toISOString() });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}
