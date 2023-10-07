import dotenv from 'dotenv';
import {Server as Index} from "socket.io";
import {socketHandler} from "./controller/socket";
dotenv.config();
import  server from 'http'
import {verifyClient} from "./middleware/client-validation";
const port = process.env.PORT;
const ins = server.createServer()



const httpServer  = ins.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export const io = new Index(httpServer, {
    cors: {
        origin: '*',
        methods: ['*'],
        credentials: true,
    }
})
io.use(verifyClient)
io.on('connection',socketHandler)
