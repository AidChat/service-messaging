import {hasher} from "../utils/methods";
import {Socket} from "socket.io";

export function verifyClient(socket: Socket, next: any) {
    try {
        let token = socket.handshake.headers.session;
        if (!token) {
            const err: Error = new Error("Not authorized");
            next(err);
        }
        if (token) {
            hasher._verify(token).then((response: any) => {
                next();
            })
                .catch((e:any) => {
                    console.log(e)
                    const err: Error = new Error("Token expired")
                    next(err);
                })
        }
    } catch (e: any) {
        const err: Error = new Error(e.message);
        next(err);
    }
}