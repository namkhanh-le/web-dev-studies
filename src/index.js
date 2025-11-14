import express from "express"
import config from "./config/config.js"
import { logMiddleware } from "./middleware/logger.js"
import { validateApiKey, validateApiKeyProduction } from "./middleware/apiKey.js"
import movieRoutes from "./routes/movieRoutes.js"
import { initializeDatabase } from "./config/database.js"

const app = express()

// Initialize database before starting server
await initializeDatabase()

// Global middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(logMiddleware)

// Public routes (no API key needed)
app.get('/', (req, res) => {
	res.json({ 
		message: "Welcome to the API",
		version: "1.0.0",
		environment: config.nodeEnv,
		endpoints: {
			movies: "/movies"
		}
	})
})

// Health check
app.get('/health', (req, res) => {
	res.json({ 
		status: 'OK',
		timestamp: new Date().toISOString(),
		environment: config.nodeEnv
	})
})

// Protected routes (API key required)
app.use('/movies', validateApiKeyProduction, movieRoutes)

// 404 handler
app.use((req, res) => {
	res.status(404).json({ 
		error: 'Not Found',
		message: `Route ${req.method} ${req.path} not found` 
	})
})

// Error handler
app.use((err, req, res, next) => {
	console.error('Error:', err)
	res.status(err.status || 500).json({
		error: err.message || 'Internal Server Error',
		...(config.isDevelopment() && { stack: err.stack })
	})
})

// Start server
app.listen(config.port, () => {
	console.log(`✅ Server running on http://localhost:${config.port}`)
	console.log(`📊 Environment: ${config.nodeEnv}`)
	console.log(`🔒 API Key protection: ${config.apiKey ? 'ENABLED' : 'DISABLED'}`)
	console.log(`\nAPI Endpoints:`)
	console.log(`  GET    /               - Welcome message (public)`)
	console.log(`  GET    /health         - Health check (public)`)
	console.log(`  GET    /movies         - Get all movies (protected)`)
	console.log(`  GET    /movies/:id     - Get movie by ID (protected)`)
	console.log(`  POST   /movies         - Create new movie (protected)`)
	console.log(`  PUT    /movies/:id     - Update movie (protected)`)
	console.log(`  DELETE /movies/:id     - Delete movie (protected)`)
})

export default app
