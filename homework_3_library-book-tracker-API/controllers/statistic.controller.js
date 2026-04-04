import { statisticService } from '../services/statistic.service.js';

export class StatisticController {
    
    getStats = async (req, res, next) => {
        try {
            const statistics = await statisticService.getStats();
            res.json(statistics);
        } catch (error) {
            next(error);
        }
    };

}
    
    
export const statisticController = new StatisticController();