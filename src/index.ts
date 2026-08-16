import { createServer } from "./infrastructure/server"

const app = createServer().listen(process.env.PORT ?? 3000)

console.log(`🦊 OKR API running at http://localhost:${app.server?.port}/swagger`)