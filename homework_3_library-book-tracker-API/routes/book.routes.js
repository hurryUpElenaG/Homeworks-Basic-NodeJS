import { Router } from 'express';
import { bookController } from '../controllers/book.controller.js';

const bookRouter = Router();


bookRouter.get('/', bookController.getBooks);
bookRouter.get('/:id', bookController.getBookById);
bookRouter.post('/', bookController.createBook);
bookRouter.delete('/:id', bookController.deleteBook);
bookRouter.put('/:id', bookController.updateBook);

export default bookRouter;
