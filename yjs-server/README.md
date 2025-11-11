# Yjs WebSocket Server

Real-time collaboration server using Yjs for the Mawa (Wafd) pilgrim management system.

## Features

- **Real-time synchronization** across multiple clients
- **Automatic conflict resolution** using Yjs CRDTs
- **Persistent connections** with automatic reconnection
- **Room-based isolation** for different collaboration contexts

## Running the Server

### Development Mode

```bash
npm install
npm run dev
```

### Production Mode

```bash
npm install
npm start
```

### Using Docker

```bash
docker build -t yjs-server .
docker run -p 1234:1234 yjs-server
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
PORT=1234
HOST=0.0.0.0
```

## How It Works

The Yjs WebSocket server:

1. **Listens for WebSocket connections** on the specified port
2. **Creates shared documents** per room (automatically managed)
3. **Syncs changes** between all connected clients in real-time
4. **Handles disconnections** gracefully with automatic cleanup

## Connection URL

Clients connect using: `ws://localhost:1234/room-name`

## Used By

- **Frontend Hall Management** - Real-time hall and bed updates
- **Frontend Pilgrim Management** - Live pilgrim status changes
- **Multi-user Collaboration** - Multiple admins working simultaneously

## Dependencies

- `yjs` - CRDT framework for conflict-free replicated data
- `y-websocket` - WebSocket provider for Yjs
- `ws` - WebSocket library for Node.js

## Health Check

Access `http://localhost:1234` to verify the server is running.

## Logging

The server logs:
- Client connections/disconnections
- Room assignments
- Current connection count

## Performance

- Handles multiple concurrent rooms
- Automatic garbage collection for unused rooms
- Low latency synchronization (typically <50ms)
