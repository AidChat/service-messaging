import {config} from "../../utils/appConfig";
import {Message, MESSAGE_CONTENT_TYPE, User} from "@prisma/client";

export function storeMessage(senderEmail: string, groupId: number, content: {
    type: MESSAGE_CONTENT_TYPE,
    content: string,
    caption?: string
}) {

    return config._query.message.create({
        data: {
            sender: {
                connect: {
                    email: senderEmail
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
            content: true,
            sender: {
                select: {
                    email: true,
                    name: true,
                    profileImage: true
                }

            },

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

export function createReceiptbyGroup(groupId: number, messageId: number) {
    try {
        config._query.group.findFirst({where: {id: groupId}, include: {User: true}})
            .then((result: any) => {
                result.User.forEach((user: User) => {
                    config._query.readReceipt.create({
                        data: {
                            user: {connect: {id: user.id}},
                            Message: {connect: {id: messageId}}
                        }
                    })
                })
            })
    } catch (e: any) {
        console.log(e)
    }
}
