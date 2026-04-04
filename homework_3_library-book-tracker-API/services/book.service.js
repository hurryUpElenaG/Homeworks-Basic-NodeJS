import { Book } from '../models/book.model.js';

export class BookService {
	//BONUS: Implementing search, filter, pagination and sorting for the getBooks method
	async getBooks({
			q, 
			genre,
			availableCopies, 
			page = 1, 
			limit = 5, 
			sortBy = 'title',
			order = 'asc',
		}) {

			const books = await Book.getAll();
			let filteredBooks = books;

			if (q) {
				filteredBooks = books.filter(book =>
					book.title.toLowerCase().includes(q.toLowerCase()) ||
					book.author.toLowerCase().includes(q.toLowerCase())
				);
			}
	
			if (genre) {
				filteredBooks = filteredBooks.filter(book => book.genre === genre);
			}

			if (availableCopies !== null && availableCopies >= 1) {
				filteredBooks = filteredBooks.filter(book => book.availableCopies === availableCopies);
			}
			
			const sortOptions = {
				title: 'title',
				author: 'author'
			};
			const field = sortOptions[sortBy] || 'title';
			const dir = order === 'asc' ? 1 : -1;
			filteredBooks.sort(
				(a, b) => dir * ((a[field] > b[field]) - (a[field] < b[field])),
			);
	
			const total = filteredBooks.length; 
			const totalPages = Math.ceil(total / limit) || 1; 
			const data = filteredBooks.slice((page - 1) * limit, page * limit); 
	
			return { data, pagination: { total, page, limit, totalPages } };
		}

	/*async getBooks() {
		const books = await Book.getAll();
		return books;
	}*/


	async getBookById(id) {
		const book = await Book.getById(id);
		return book;
	}

	
	createBook(data) {
		return Book.create(data);
	}

	updateBook(id, { availableCopies }) {
		return Book.update(id, { availableCopies });
	}

	/*async deleteBook(id) {
    	return await Book.deleteBook(id);
  	}*/


	async deleteBook(id) {
		const books = await Book.getAll();

		const index = books.findIndex(book => book.id === id);

		if (index === -1) {
			//return null;
			const error = new Error(`Book with id: ${id} not found.`);
			error.status = 404;
			//return next(error);
			throw error;
		}

		const book = books[index];
		if (book.availableCopies !== book.copies) {
			const error = new Error(`Cannot delete book with id: ${id} because there are currently loaned copies.`);
			error.status = 400;
			//return next(error);
			throw error;
		}

		await Book.deleteBook(id);
	}
}

export const bookService = new BookService();
