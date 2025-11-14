import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import config from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Determine database path
let dbPath

if (path.isAbsolute(config.databaseUrl)) {
	// Absolute path (production)
	dbPath = config.databaseUrl
} else {
	// Relative path (development)
	dbPath = path.join(__dirname, '../../', config.databaseUrl)
}

console.log(`📊 Database path: ${dbPath}`)

// Create / connect to SQLite DB
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Initialize database tables
export const initializeDatabase = async () => {
	console.log('🔧 Initializing database...')

	// Import Movie model
	const Movie = (await import('../models/Movie.js')).default

	// Create Movies table
	Movie.createTable()

	// Seed only in development
	if (config.isDevelopment() && typeof Movie.seed === 'function') {
		Movie.seed()
	}

	console.log('✅ Database initialization complete')
}

export default db
