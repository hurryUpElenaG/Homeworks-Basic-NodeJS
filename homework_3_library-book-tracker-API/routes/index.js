import { Router } from 'express';
import bookRouter from './book.routes.js';
import loanRouter from './loan.routes.js';
import statisticRouter from './statistic.routes.js';

const router = Router();

router.use('/books', bookRouter);
router.use('/loans', loanRouter);
router.use('/stats', statisticRouter);


export default router;
