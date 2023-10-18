import dotenv from 'dotenv';
import {Server as Index} from "socket.io";
import {SocketEmitters, socketHandler, SocketListeners} from "./controller/socket";

dotenv.config();
import server from 'http'
import {verifyClient} from "./middleware/client-validation";
import {hasher} from "./utils/methods";
import {getSocketGroup, storeMessage} from "./controller/message";
import {Group, MESSAGE_CONTENT_TYPE} from "@prisma/client";

const port = process.env.PORT;
const ins = server.createServer()


const httpServer = ins.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export const io = new Index(httpServer, {
    cors: {origin: "*"}
})
io.use(verifyClient)
io.on('connection', socketHandler)
