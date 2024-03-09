import {config} from "../../utils/appConfig";
import { MESSAGE_CONTENT_TYPE, User} from "@prisma/client";

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
                            User: {connect: {id: user.id}},
                            Message: {connect: {id: messageId}},
                        }
                    }).then(result)
                })
            })
    } catch (e: any) {
        console.log(e)
    }
}

export function updateMessageRecepientStatus(userId: number, messageId: number) {
    let status = 'Read';
    config._query.readReceipt.updateMany({
        data: {status},
        where: {messageId, userId}
    }).then(result => {
    })
}

export function checkIfReadByAll(messageId: number): Promise<void> {
    return config._query.message.findUnique({
        where: {id: messageId},
        include: {ReadReceipt: true, sender: true, content: true}
    })
}

export function getUserGroups(userId: number) {
    return config._query.group.findMany({
        where: {
            User: {
                some: {
                    id: userId // Assuming userId is the specific user ID you're looking for
                }
            }
        },
        include: {
            Socket: true
        }
    })
}

export function changeUserStatus(userId: number, status: "ONLINE" | "OFFLINE" | "INACTIVE" | "BANNED" | "LEAVE" | "AWAY") {
    config._query.activityStatus.upsert({
        where: {
          userId:userId
        },
        update: {
            status: status
        },
        create: {

                userId:userId,
                status: status,

        }
    }).then((result: any) => {
    })
}