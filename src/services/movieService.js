import Movie from '../models/Movie.js'

// Get all movies
export const getAllMovies = () => {
	return Movie.findAll()
}

// Get movie by ID
export const getMovieById = (id) => {
	return Movie.findById(id)
}

// Create new movie
export const createMovie = (movieData) => {
	const { name, director, year, rating } = movieData

	// Required field validation (business logic)
	if (!name || !director || !year) {
		throw new Error('Name, director, and year are required')
	}

	return Movie.create({ name, director, year, rating })
}

// Update movie
export const updateMovie = (id, movieData) => {
	const { name, director, year, rating } = movieData

	// Check if movie exists
	const existingMovie = Movie.findById(id)
	if (!existingMovie) {
		return null
	}

	return Movie.update(id, { name, director, year, rating })
}

// Delete movie
export const deleteMovie = (id) => {
	return Movie.delete(id)
}

// Additional service methods
export const getMovieCount = () => {
	return Movie.count()
}
