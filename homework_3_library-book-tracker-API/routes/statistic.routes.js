import { Router } from 'express';
import { statisticController } from '../controllers/statistic.controller.js';

const statisticRouter = Router();

statisticRouter.get('/', statisticController.getStats);


export default statisticRouter;