import { Router } from 'express';
import { loanController } from '../controllers/loan.controller.js';

const loanRouter = Router();


loanRouter.get('/', loanController.getLoans);
loanRouter.get('/:id', loanController.getLoanById);
loanRouter.post('/', loanController.createLoan);
loanRouter.put('/:id', loanController.updateLoan);


export default loanRouter;