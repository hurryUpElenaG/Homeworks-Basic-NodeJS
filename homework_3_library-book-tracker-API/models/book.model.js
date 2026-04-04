import { randomUUID } from 'crypto';
import { DbService } from '../services/db.service.js';

export class BookModel {
	
	#db = new DbService('books.json');

	#read() {
		return this.#db.read();
	}

	#write(books) {
		return this.#db.write(books);
	}

	
	getAll() {
		return this.#read();
	}


	async getById(id) {
		const books = await this.#read();

		const book = books.find(book => book.id === id);

		return book ?? null;
	}


	async create({ title, author, genre, year, copies }) {
		const books = await this.#read();

		const isExists = books.some(
			book => book.title.toLowerCase() === title.toLowerCase() && book.author.toLowerCase() === author.toLowerCase(),
		);

		if (isExists) {
			throw new Error(`Book with title: ${title} and author: ${author} already exists.`);
		}

		const book = {
			id: randomUUID(),
            title,
            author,
            genre,
            year: year || null,
            copies: copies || 1,
			availableCopies: copies
		};

		books.push(book);
		this.#write(books);

		return book;
	}


	async update(id,{ availableCopies }) {
		const books = await this.#read();

		const index = books.findIndex(book => book.id === id);

		if (index === -1) {
			const err = new Error(`Book with ID: ${id} doesn't exist.`);
			err.status = 404;
			throw err;
		}

		books[index] = {
			...books[index],
			availableCopies: availableCopies || books[index].availableCopies
		};

		this.#write(books);

		return books[index];
	}


	/*async deleteBook(id) {
    	const books = await this.getAll();
    	const filteredBooks = books.filter((book) => book.id !== id);

    	this.#write(filteredBooks);
    }*/

	async deleteBook(id) {
		const books = await this.getAll();
		const bookIndex = books.findIndex((book) => book.id === id);

		books.splice(bookIndex, 1);
		this.#write(books);
	}

}

export const Book = new BookModel();
