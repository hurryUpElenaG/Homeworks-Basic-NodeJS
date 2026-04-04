import { randomUUID } from 'crypto';
import { DbService } from '../services/db.service.js';

export class LoanModel {
    
    #db = new DbService('loans.json');

    static STATUS = {
		ACTIVE: 'active',
        RETURNED: 'returned',
        OVERDUE: 'overdue'
	};

    #read() {
        return this.#db.read();
    }

    #write(loans) {
        return this.#db.write(loans);
    }

    
    getAll() {
        return this.#read();
    }


    async getById(id) {
        const loans = await this.#read();

        const loan = loans.find(loan => loan.id === id);

        return loan ?? null;
    }

        
    async create({ bookId, borrower }) {
        const loans = await this.#read();

        const loan = {
            id: randomUUID(),
            bookId,
            borrower,
            loanDate: new Date(Date.now()).toISOString(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // default due date is 2 weeks from now
            returnDate: null,
            status: LoanModel.STATUS.ACTIVE
        };

        loans.push(loan);
        this.#write(loans);

        return loan;
    }

    async update(id,{status, returnDate}) {
		const loans = await this.#read();

		const index = loans.findIndex(loan => loan.id === id);

		if (index === -1) {
			const err = new Error(`Loan with ID: ${id} doesn't exist.`);
			err.status = 404;
			throw err;
		}

		loans[index] = {
			...loans[index],
			status: status || loans[index].status,
			returnDate: returnDate || loans[index].returnDate
		};

		this.#write(loans);

		return loans[index];
	}    
}

export const Loan = new LoanModel();
