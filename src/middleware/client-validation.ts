import {hasher} from "../utils/methods";
import {Socket} from "socket.io";

export function verifyClient(socket: Socket, next: any) {
    try {
        let token =  socket.handshake.auth.session;

        if (!token) {

            const err: Error = new Error("Not authorized");
            console.log(err)
            next(err);
        }
        if (token) {
            hasher._verify(token).then((result:any) => {
                next();
            })
                .catch((e: any) => {
                    console.log(e)
                    const err: Error = new Error("Token expired")
                    next(err);
                })
        }
    } catch (e: any) {
        console.log(e)
        const err: Error = new Error(e.message);
        next(err);
    }
}