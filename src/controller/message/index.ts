import {config} from "../../utils/appConfig";
import {MESSAGE_CONTENT_TYPE} from "@prisma/client";

export function storeMessage(senderEmail: string, groupId: number, content: {
    type: MESSAGE_CONTENT_TYPE,
    content: string,
    caption?: string
}) {
    config._query.message.create({
        data: {
            sender: {
                connect: {
                    email:senderEmail
                }
            },
            Group: {
                connect: {
                    id: groupId
                }
            },
            content: {
                create: {
                    TYPE: content.type,
                    content: content.content,
                    caption: content.caption
                }
            }
        },
        include: {
            content: true
        }
    })
}


export function getSocketGroup(socketId: string): Promise<any> {
    return new Promise((resolve, reject) => {
        try {
            if (!socketId) {
                reject("Socket not found")
            }
            config._query.socket.findUnique({
                where: {
                    socket_id: socketId
                },
                include: {
                    Group: true
                }
            })
                .then((response: any) => {
                    resolve(response.Group);
                })
                .catch((error: any) => {
                    reject("Error");
                })
        } catch (e) {
            reject("Error");
        }
    })

}
