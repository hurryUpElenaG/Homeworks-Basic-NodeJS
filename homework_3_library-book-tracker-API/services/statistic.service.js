import { loanService } from './loan.service.js';
import { Book } from '../models/book.model.js';
import { LoanModel } from '../models/loan.model.js';


export class StatisticService {

    async getStats() {
        
        const books = await Book.getAll();
        const loans = await loanService.getLoans();

        const totalBooks = books.length;

        const totalLoans = loans.length;

        const activeLoansCount = loans.filter(loan => loan.status === LoanModel.STATUS.ACTIVE).length;
        
        const mostBorrowedBook = books
            .map(book => ({
                ...book,
                borrowCount: loans.filter(loan => loan.bookId === book.id).length
            }))
            .sort((a, b) => b.borrowCount - a.borrowCount)[0];

        const topBorrower = [...new Set(loans.map(l => l.borrower))]
            .map(borrower => ({
                borrower,
                borrowCount: loans.filter(l => l.borrower === borrower).length
            }))
            .sort((a, b) => b.borrowCount - a.borrowCount)[0];

        return {
            totalBooks,
            totalLoans,
            activeLoansCount,
            mostBorrowedBook,
            topBorrower
        };
    }
}

export const statisticService = new StatisticService();