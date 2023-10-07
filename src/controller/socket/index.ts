import {io} from "../../app";
import {getSocketGroup, storeMessage} from "../message";
import {Group, MESSAGE_CONTENT_TYPE} from "@prisma/client";
import {hasher} from "../../utils/methods";

export const socketHandler = () => {
    try {
        io.on('connection', (socket) => {
            if (!socket.handshake.headers.socketid) {
                return
            }
            if (!socket.handshake.headers.session) {
                return
            }
            socket.join(<string>socket.handshake.headers.socketid);
            socket.on(SocketListeners._MESSAGE, (data: { text: any; }) => {
                getSocketGroup(<string>socket.handshake.headers.socketid).then((group: Group) => {
                    hasher._verify(socket.handshake.headers.session).then((response: any) => {
                        storeMessage(<string>response.data, group.id, {type: MESSAGE_CONTENT_TYPE.TEXT, content: data.text})
                    })
                })
                io.to(<string>socket.handshake.headers.socketid).emit(SocketEmitters.MESSAGE, data);
            });
            socket.on(SocketListeners._DISCONNECT, () => {
                socket.leave(<string>socket.handshake.headers.socketid);
            });


            socket.on(SocketListeners._TYPING,({name}) =>{
                socket.to(<string>socket.handshake.headers.socketid).emit(SocketEmitters.TYPING,{name})
            })

        });
    } catch (e) {
        process.exit(1)
    }
};

enum SocketListeners {
    _MESSAGE = "_MESSAGE",
    _DISCONNECT ='_DISCONNECT',
    _TYPING = '_TYPING'

}

enum SocketEmitters {
    MESSAGE = "MESSAGE",
    TYPING ="TYPING"
}