import { bookService } from '../services/book.service.js';

export class BookController {
	
	getBooks = async (req, res, next) => {
		try {
			const query = req.query;
			const books = await bookService.getBooks(query);
			res.json(books);
		} catch (error) {
			next(error);
		}
	};

	
	getBookById = async (req, res, next) => {
		try {
			
			const id = req.params.id;
			const book = await bookService.getBookById(id);

			if (!book) {
				const error = new Error(`Book with id: ${id} not found.`);
				error.status = 404;
				return next(error);
			}

			res.json(book);
		} catch (error) {
			next(error);
		}
	};

	
	createBook = async (req, res, next) => {
		try {
			const { title, author, genre, year, copies } = req.body;

			if (!title || !author || !genre) {
				const error = new Error('Title, author, and genre are required fields.');
				error.status = 400;

				return next(error);
			}

			const book = await bookService.createBook({
				title,
				author,
				genre,
				year,
                copies
			});

			res.status(201).json(book);
		} catch (error) {
			if (error.message.includes('already exists')) {
				error.status = 409;
			}
			next(error);
		}
	};


	updateBook = async (req, res, next) => {
		try {
			const id = req.params.id;
			const { availableCopies } = req.body;

			const book = await bookService.updateBook(id, { availableCopies });

			if (!book) {
				const error = new Error(`Book with id: ${id} not found.`);
				error.status = 404;
				return next(error);
			}

			res.json(book);
		} catch (error) {
			next(error);
		}
	};
	

	deleteBook = async (req, res, next) => {
		try {
			const id = req.params.id;
			const deletedBook = await bookService.deleteBook(id);	
			
			res.json(deletedBook);
		} catch (error) {
			next(error);
		}	
	}
}


export const bookController = new BookController();
