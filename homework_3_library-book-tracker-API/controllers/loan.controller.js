import { loanService } from '../services/loan.service.js';

export class LoanController {
	
	getLoans = async (req, res, next) => {
		try {
			const loans = await loanService.getLoans();
			res.json(loans);
		} catch (error) {
			next(error);
		}
	};

	
	getLoanById = async (req, res, next) => {
		try {
		
			const id = req.params.id;
			const loan = await loanService.getLoanById(id);

			res.json(loan);
		} catch (error) {
			next(error);
		}
	};

  createLoan = async (req, res, next) => {
    try{

      const {bookId, borrower} = req.body;

        if (!bookId || !borrower) {
          const error = new Error('Book ID and borrower are required fields.');
          error.status = 400;

          return next(error);
        }

        const loan = await loanService.createLoan({
            bookId,
            borrower
        });

        res.status(201).json(loan);
    } catch (error) {
      next(error);
    }
  };


  updateLoan = async (req, res, next) => {
      try {
        const id = req.params.id;
  
        const loan = await loanService.updateLoan(id);
  
        res.json(loan);
      } catch (error) {
        next(error);
      }
    };
}


export const loanController = new LoanController();


