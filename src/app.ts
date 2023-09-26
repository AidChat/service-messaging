import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import {config} from "./utils/appConfig";
import {hasher} from "./utils/methods";
import {verifyClient} from "./middleware/client-validation";
dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const authentication = require('./routes/authentication');

app.use(express.json())
app.get(config._urlParser('/'),verifyClient,(req: Request, res: Response) => {
    res.send('service-messaging');
});



app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});