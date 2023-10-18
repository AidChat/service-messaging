import {getSocketGroup, storeMessage} from "../message";
import {Group, MESSAGE_CONTENT_TYPE} from "@prisma/client";
import {hasher} from "../../utils/methods";
import {Socket} from "socket.io";

export const socketHandler = (socket:Socket) => {
    try {
        socket.on('JOIN', ({socketId}) => {
            socket.join(<string>socketId);
        })


        socket.on(SocketListeners._MESSAGE, (data: { text: string }) => {
            getSocketGroup(<string>socket.handshake.auth.socketID).then((group: Group) => {
                hasher._verify(socket.handshake.auth.session).then((response: any) => {
                    storeMessage(<string>response.data, group.id, {
                        type: MESSAGE_CONTENT_TYPE.TEXT,
                        content: data.text
                    })
                        .then((result: any)=>{
                            result.MessageContent = result.content;
                            socket.to(<string>socket.handshake.auth.socketID).emit(SocketEmitters.MESSAGE, result)
                        })
                })
            })

        });

        socket.on(SocketListeners._TYPING, () => {
            hasher._verify(socket.handshake.auth.session).then((response: any) => {
                socket.to(<string>socket.handshake.auth.socketID).emit(SocketEmitters.TYPING, {name:response.data});
            })

        })

        socket.on(SocketListeners._DISCONNECT, ({socketId}) => {
            hasher._verify(socket.handshake.auth.session).then((response: any) => {
                socket.leave(<string>socketId);
            })

        });


    } catch (e) {
        process.exit(1)
    }
};

export interface Message {
    content: string,
    userId: number | string
}

export enum SocketListeners {
    _MESSAGE = "_MESSAGE",
    _DISCONNECT = '_DISCONNECT',
    _TYPING = '_TYPING'
}

export enum SocketEmitters {
    MESSAGE = "MESSAGE",
    TYPING = "TYPING"
}