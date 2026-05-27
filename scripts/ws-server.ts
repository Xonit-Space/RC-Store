import { initializeWSServer } from "../src/realtime/gateway/ws-gateway"
import "dotenv/config"

const PORT = parseInt(process.env.WS_PORT || "3001", 10)

const wss = initializeWSServer(PORT)

console.log(`[WebSocket Gateway] Running on ws://localhost:${PORT}`)

process.on("SIGTERM", () => {
  wss.close()
  process.exit(0)
})
