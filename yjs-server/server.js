import http from 'http'
import { WebSocketServer } from 'ws'
import * as Y from 'yjs'

const port = process.env.PORT || 1234
const host = process.env.HOST || 'localhost'

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('Yjs WebSocket Server is running\n')
})

const wss = new WebSocketServer({ server })

// Store documents and connections per room
const docs = new Map()
const conns = new Map()

const getYDoc = (docName) => {
  if (!docs.has(docName)) {
    const doc = new Y.Doc()
    docs.set(docName, doc)
    conns.set(docName, new Set())
    console.log(`[${new Date().toISOString()}] Created new document: ${docName}`)
  }
  return docs.get(docName)
}

wss.on('connection', (ws, req) => {
  // Parse room name from URL
  const url = new URL(req.url, `http://${req.headers.host}`)
  const docName = url.searchParams.get('room') || 'default-room'
  
  console.log(`[${new Date().toISOString()}] Client connected to room: ${docName}`)
  
  const doc = getYDoc(docName)
  const roomConns = conns.get(docName)
  roomConns.add(ws)
  
  // Store room name on ws for cleanup
  ws.docName = docName
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      // Simply broadcast the message to all other clients in the same room
      // Don't try to parse it - let y-websocket library handle the protocol
      roomConns.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(message, { binary: true })
        }
      })
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error broadcasting message:`, error.message)
    }
  })
  
  console.log(`Total connections in room "${docName}": ${roomConns.size}`)
  
  ws.on('close', () => {
    roomConns.delete(ws)
    console.log(`[${new Date().toISOString()}] Client disconnected from room: ${docName}`)
    console.log(`Total connections in room "${docName}": ${roomConns.size}`)
    
    // Clean up empty rooms
    if (roomConns.size === 0) {
      docs.delete(docName)
      conns.delete(docName)
      console.log(`[${new Date().toISOString()}] Room "${docName}" cleaned up`)
    }
  })
  
  ws.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] WebSocket error:`, error.message)
  })
})

server.listen(port, host, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  Yjs WebSocket Server                      ║
║  Running on: ws://${host}:${port}${' '.repeat(Math.max(0, 16 - host.length - port.toString().length))}║
║  Status: Ready for connections             ║
╚════════════════════════════════════════════╝
  `)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})
