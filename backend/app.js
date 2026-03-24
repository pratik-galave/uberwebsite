import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { router } from './routes.js';
import e from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());
app.use('/api', router);    

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;