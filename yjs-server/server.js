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

// Store documents in memory
const docs = new Map()

const getYDoc = (docName) => {
  if (!docs.has(docName)) {
    const doc = new Y.Doc()
    docs.set(docName, doc)
    console.log(`[${new Date().toISOString()}] Created new document: ${docName}`)
  }
  return docs.get(docName)
}

wss.on('connection', (ws, req) => {
  const docName = req.url?.slice(1) || 'default-room'
  console.log(`[${new Date().toISOString()}] Client connected to room: ${docName}`)
  
  const doc = getYDoc(docName)
  
  // Send initial state
  const encoder = Y.encodeStateAsUpdate(doc)
  ws.send(encoder)
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const update = new Uint8Array(message)
      Y.applyUpdate(doc, update)
      
      // Broadcast to all other clients in the same room
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(update)
        }
      })
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error processing message:`, error)
    }
  })
  
  // Handle state updates
  doc.on('update', (update) => {
    if (ws.readyState === 1) {
      ws.send(update)
    }
  })
  
  console.log(`Total connections: ${wss.clients.size}`)
  
  ws.on('close', () => {
    console.log(`[${new Date().toISOString()}] Client disconnected from room: ${docName}`)
    console.log(`Total connections: ${wss.clients.size}`)
  })
  
  ws.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] WebSocket error:`, error)
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
