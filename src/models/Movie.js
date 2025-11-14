import db from '../config/database.js'

// Define the Movie model
class Movie {
	// Table name
	static tableName = 'movies'
	
	// Create the movies table
	static createTable() {
		const sql = `
			CREATE TABLE IF NOT EXISTS ${this.tableName} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				director TEXT NOT NULL,
				year INTEGER NOT NULL,
				rating REAL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`
		db.exec(sql)
		console.log(`✅ Table '${this.tableName}' created/verified`)
	}

	// Get all movies
	static findAll() {
		const stmt = db.prepare(`SELECT * FROM ${this.tableName} ORDER BY id`)
		return stmt.all()
	}

	// Find movie by ID
	static findById(id) {
		const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
		return stmt.get(id)
	}

	// Create new movie
	static create(movieData) {
		const { name, director, year, rating } = movieData

		const stmt = db.prepare(`
			INSERT INTO ${this.tableName} (name, director, year, rating) 
			VALUES (?, ?, ?, ?)
		`)
		const result = stmt.run(name, director, year, rating || null)
		return this.findById(result.lastInsertRowid)
	}

	// Update movie
	static update(id, movieData) {
		const { name, director, year, rating } = movieData
		
		const updates = []
		const values = []

		if (name !== undefined) {
			updates.push('name = ?')
			values.push(name)
		}
		if (director !== undefined) {
			updates.push('director = ?')
			values.push(director)
		}
		if (year !== undefined) {
			updates.push('year = ?')
			values.push(year)
		}
		if (rating !== undefined) {
			updates.push('rating = ?')
			values.push(rating)
		}

		// Always update timestamp
		updates.push('updated_at = CURRENT_TIMESTAMP')

		if (updates.length === 1) {
			return this.findById(id)
		}

		values.push(id)

		const stmt = db.prepare(`
			UPDATE ${this.tableName}
			SET ${updates.join(', ')}
			WHERE id = ?
		`)

		stmt.run(...values)
		return this.findById(id)
	}

	// Delete movie
	static delete(id) {
		const stmt = db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`)
		const result = stmt.run(id)
		return result.changes > 0
	}

	// Count total movies
	static count() {
		const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName}`)
		return stmt.get().count
	}

	// Seed sample movies
	static seed() {
		const count = this.count()

		if (count === 0) {
			console.log('🎬 Seeding movies table...')

			const sampleMovies = [
				{ name: 'Peppa Pig My First Cinema Experience', director: 'Mark Baker', year: 207, rating: 8.8 },
				{ name: 'Marty Supreme', director: 'Josh Safdie', year: 2025, rating: 8.6 },
				{ name: 'The Matrix', director: 'Lana Wachowski, Lilly Wachowski', year: 1999, rating: 8.7 },
				{ name: 'Parasite', director: 'Bong Joon-ho', year: 2019, rating: 8.5 }
			]

			sampleMovies.forEach(movie => this.create(movie))
			console.log(`✅ Seeded ${sampleMovies.length} movies`)
		}
	}
}

export default Movie
