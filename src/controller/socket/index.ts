import {
    changeUserStatus,
    checkIfReadByAll,
    createReceiptbyGroup,
    getSocketGroup,
    getUserGroups,
    storeMessage,
    updateMessageRecepientStatus
} from "../message";
import {Group, MESSAGE_CONTENT_TYPE} from "@prisma/client";
import {hasher} from "../../utils/methods";
import {Socket} from "socket.io";

export const socketHandler = (socket: Socket) => {
    try {
        hasher._verify(socket.handshake.auth.session).then((response: any) => {
            getUserGroups(response.user_id).then(res => {
                res.forEach((group: { Socket: { socket_id: string | string[]; }; }) => {
                    socket.to(group.Socket.socket_id).emit(SocketEmitters.USERONLINE, {user: response.user_id})
                    changeUserStatus(response.user_id, 'ONLINE');
                })
            })
        })
        socket.on(SocketListeners._JOIN, ({socketId}) => {
            socket.join(<string>socketId);
        })
        socket.on(SocketListeners._MESSAGE, (data: { text: string }) => {
            getSocketGroup(<string>socket.handshake.auth.socketID).then((group: Group) => {
                hasher._verify(socket.handshake.auth.session).then((response: any) => {
                    storeMessage(<string>response.data, group.id, {
                        type: MESSAGE_CONTENT_TYPE.TEXT, content: data.text
                    })
                        .then((result: any) => {
                            createReceiptbyGroup(group.id, result.id);
                            result.User = result.sender
                            result.ReadReceipt = [{}];
                            result.MessageContent = result.content;
                            socket.to(<string>socket.handshake.auth.socketID).emit(SocketEmitters.MESSAGE, result)
                        })
                })
            })

        });

        socket.on(SocketListeners._TYPING, () => {
            hasher._verify(socket.handshake.auth.session).then((response: any) => {
                socket.broadcast.to(<string>socket.handshake.auth.socketID).emit(SocketEmitters.TYPING, {name: response.data});
            })

        })
        socket.on('disconnect', () => {
            hasher._verify(socket.handshake.auth.session).then((response: any) => {
                changeUserStatus(response.user_id, 'OFFLINE');
                getUserGroups(response.user_id).then(res => {
                    res.forEach((group: { Socket: { socket_id: string | string[]; }; }) => {
                        socket.broadcast.to(group.Socket.socket_id).emit(SocketEmitters.USEROFFLINE, {user: response.user_id})
                    })
                })
            })
        })

        socket.on(SocketListeners._DISCONNECT, ({socketId}) => {
            hasher._verify(socket.handshake.auth.session).then((response: any) => {
                socket.leave(<string>socketId);
            })
        });


        socket.on(SocketListeners._READMESSAGE, ({userId, messageId}) => {
            updateMessageRecepientStatus(userId, messageId)
            checkIfReadByAll(messageId).then((result: any) => {
                if (result.ReadReceipt.filter((item: { status: string; }) => item.status !== 'Sent').length === 0) {
                    socket.emit(SocketEmitters.READBYALL, {
                        ...result, User: result.sender, MessageContent: result.content, ReadByAll: true
                    })
                }
            })
        })


    } catch (e) {
        process.exit(1)
    }
};



export enum SocketListeners {
    _MESSAGE = "_MESSAGE",
    _DISCONNECT = '_DISCONNECT',
    _TYPING = '_TYPING',
    _JOIN = '_JOIN',
    _ONLINE = '_ONLINE',
    _READMESSAGE = '_READMESSAGE'
}

export enum SocketEmitters {
    MESSAGE = "MESSAGE",
    TYPING = "TYPING",
    READBYALL = 'READBYALL',
    USERONLINE = 'USERONLINE',
    USEROFFLINE = 'USEROFFLINE'
}

