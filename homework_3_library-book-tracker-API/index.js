import express from 'express';
import router from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const HOSTNAME = 'localhost';

const app = express();

app.use(express.json());
app.use('/api', router);
app.use(errorHandler);

app.listen(PORT, HOSTNAME, () => {
	console.log(`Started listening on http://${HOSTNAME}:${PORT}`);
});
