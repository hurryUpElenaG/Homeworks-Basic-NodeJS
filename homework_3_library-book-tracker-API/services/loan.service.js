import { Loan, LoanModel } from '../models/loan.model.js';
import { Book } from '../models/book.model.js';
import { bookService } from './book.service.js';

export class LoanService {

    async getLoans() {
        const loans = await Loan.getAll();

        //return Promise.all(loans.map((loan) => this.#enrich(loan)));
        return Promise.all(loans.map(async (loan) => {                                  
                                        const enrichedLoan = await this.#enrich(loan);
                                        return this.#detectOverdueLoan(enrichedLoan);           //BONUS
                                    }));
        
    }


    async getLoanById(id) {
        const loan = await Loan.getById(id);
        
        if (!loan) {
            const err = new Error(`Loan with ID:${id} doesn't exist.`);
            err.status = 404;
            throw err;
        }

        //return this.#enrich(loan);
        const enrichedLoan = await this.#enrich(loan);
        return this.#detectOverdueLoan(enrichedLoan);      //BONUS
    }

    
    async createLoan({bookId, borrower}) {
        const book = await Book.getById(bookId);

        if (!book) {
            const err = new Error(`Book doesn't exist.`);
            err.status = 404;
            throw err;
        }

        if (book.availableCopies < 1) {
            const err = new Error(`No available copies for book with id: ${bookId}.`);
            err.status = 400;
            throw err;
        }
        const loan = await Loan.create({ bookId, borrower });
     
        await bookService.updateBook(bookId, { availableCopies: book.availableCopies - 1 });

        return loan;  
    }


    async updateLoan(id) {

        const existingLoan = await Loan.getById(id);

        if (!existingLoan) {
            const err = new Error(`Loan with id: ${id} not found`);
            err.status = 404;
            throw err;
        }

        //Cannot return a loan twice
        if (existingLoan.status === LoanModel.STATUS.RETURNED) {
            const err = new Error("Loan is already returned.");
            err.status = 400;
            throw err;
        }

        const updatedLoan = await Loan.update(id, {status: LoanModel.STATUS.RETURNED, returnDate: new Date(Date.now()).toISOString()}); 

        const book = await Book.getById(existingLoan.bookId);

        if (!book) {
            const err = new Error("Book not found");
            err.status = 404;
            throw err;
        }

         // only increment if status changed TO RETURNED
        if (existingLoan.status !== LoanModel.STATUS.RETURNED && updatedLoan.status === LoanModel.STATUS.RETURNED) {
            await bookService.updateBook(existingLoan.bookId, {availableCopies: book.availableCopies + 1});
        }

        return updatedLoan;
    }


    async #enrich(loan) {
        const book = await Book.getById(loan.bookId);

        return {
            ...loan,
            bookTitle: book.title
        }; 
    }

    //BONUS
    #detectOverdueLoan(loan) {  
        const now = new Date();

        if (loan.status === LoanModel.STATUS.ACTIVE && new Date(loan.dueDate) < now) {
            return {
                ...loan,
                status: LoanModel.STATUS.OVERDUE
            };
        }

        return loan;
    }
}

export const loanService = new LoanService();
